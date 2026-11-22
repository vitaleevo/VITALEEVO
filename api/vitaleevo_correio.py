"""Correio empresarial no Vercel: IMAP/SMTP do cPanel, sem Railway.
Endpoints HTTP em /api/vitaleevo_correio. Sem dependências externas.
Protecção por senha própria e cookie assinado; nunca expor credenciais ao browser.
"""
from http.server import BaseHTTPRequestHandler
from email.message import EmailMessage
from email import message_from_bytes, policy
from email.utils import getaddresses
import hashlib
import hmac
import imaplib
import json
import os
import re
import smtplib
import ssl
import time
from http.cookies import SimpleCookie
from urllib.parse import urlsplit, parse_qs

COOKIE = "vitaleevo_mail_session"
SESSION_SECONDS = 4 * 60 * 60
HOST = os.getenv("VMAIL_HOST", "mail.vitaleevo.ao")
ACCOUNTS = {
    "info": ("VMAIL_INFO_USER", "VMAIL_INFO_PASSWORD"),
    "alexandre": ("VMAIL_ALEXANDRE_USER", "VMAIL_ALEXANDRE_PASSWORD"),
}
EMAIL_RE = re.compile(r"^[A-Za-z0-9.!#$%&'*+/=?^_\x60{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?$")

def json_error(message):
    return {"error": message}

def session_secret():
    secret = os.getenv("VMAIL_SESSION_SECRET", "")
    return secret if len(secret) >= 32 else None

def expected_password():
    val = os.getenv("VMAIL_ADMIN_PASSWORD", "")
    return val if len(val) >= 16 else None

def make_cookie():
    expiry = int(time.time()) + SESSION_SECONDS
    data = f"v1.{expiry}"
    sig = hmac.new(session_secret().encode(), data.encode(), hashlib.sha256).hexdigest()
    value = f"{data}.{sig}"
    secure = "; Secure" if os.getenv("VERCEL") else ""
    return f"{COOKIE}={value}; Path=/api/vitaleevo_correio; HttpOnly; SameSite=Strict; Max-Age={SESSION_SECONDS}{secure}"

def cookie_ok(headers):
    secret = session_secret()
    if not secret:
        return False
    try:
        jar = SimpleCookie()
        jar.load(headers.get("Cookie", ""))
        value = jar[COOKIE].value
        version, expiry, signature = value.split(".")
        if version != "v1" or int(expiry) < time.time() or int(expiry) > time.time() + SESSION_SECONDS:
            return False
        correct = hmac.new(secret.encode(), f"v1.{expiry}".encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(signature, correct)
    except (ValueError, KeyError, TypeError):
        return False

def account_config(which):
    if which not in ACCOUNTS:
        raise ValueError("Conta não permitida")
    user_name, pass_name = ACCOUNTS[which]
    user, password = os.getenv(user_name, ""), os.getenv(pass_name, "")
    if not user or not password or not EMAIL_RE.fullmatch(user):
        raise RuntimeError("Credenciais desta caixa não configuradas na Vercel")
    return user, password

def response_headers(handler, status, cookie=None):
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Cache-Control", "no-store, private")
    handler.send_header("X-Content-Type-Options", "nosniff")
    handler.send_header("Referrer-Policy", "no-referrer")
    if cookie:
        handler.send_header("Set-Cookie", cookie)
    handler.end_headers()

def extract_literal(rows):
    for part in rows or []:
        if isinstance(part, tuple) and len(part) >= 2 and isinstance(part[1], bytes):
            return part[1]
    return None

def mailbox_list(which):
    user, password = account_config(which)
    with imaplib.IMAP4_SSL(HOST, port=993, ssl_context=ssl.create_default_context(), timeout=18) as imap:
        imap.login(user, password)
        status, _ = imap.select("INBOX", readonly=True)
        if status != "OK":
            raise RuntimeError("Não foi possível abrir a caixa de entrada")
        status, found = imap.uid("search", None, "ALL")
        if status != "OK":
            raise RuntimeError("Falha na pesquisa IMAP")
        uids = (found[0] or b"").split()[-25:]
        messages = []
        for uid in reversed(uids):
            status, parts = imap.uid("fetch", uid, "(BODY.PEEK[HEADER.FIELDS (DATE FROM SUBJECT)] RFC822.SIZE)")
            raw = extract_literal(parts)
            if status != "OK" or not raw:
                continue
            item = message_from_bytes(raw, policy=policy.default)
            messages.append({
                "uid": uid.decode("ascii"),
                "from": str(item.get("From", ""))[:300],
                "subject": str(item.get("Subject", "(sem assunto)"))[:300],
                "date": str(item.get("Date", ""))[:150],
            })
        imap.logout()
        return messages

def mailbox_read(which, uid):
    if not re.fullmatch(r"[0-9]{1,15}", uid or ""):
        raise ValueError("Mensagem inválida")
    user, password = account_config(which)
    with imaplib.IMAP4_SSL(HOST, port=993, ssl_context=ssl.create_default_context(), timeout=18) as imap:
        imap.login(user, password)
        imap.select("INBOX", readonly=True)
        status, parts = imap.uid("fetch", uid, "(RFC822.SIZE)")
        sizes = b" ".join(p if isinstance(p, bytes) else p[0] for p in parts or [] if isinstance(p, (bytes, tuple)))
        match = re.search(rb"RFC822.SIZE\s+(\d+)", sizes)
        if status != "OK" or not match:
            raise ValueError("Mensagem não encontrada")
        if int(match.group(1)) > 700_000:
            raise ValueError("Mensagem demasiado grande para leitura nesta versão")
        status, parts = imap.uid("fetch", uid, "(BODY.PEEK[])")
        raw = extract_literal(parts)
        if status != "OK" or not raw:
            raise ValueError("Mensagem não encontrada")
        msg = message_from_bytes(raw, policy=policy.default)
        body = msg.get_body(preferencelist=("plain",))
        text = body.get_content() if body else "(Mensagem sem versão de texto simples)"
        imap.logout()
        return {
            "uid": uid, "from": str(msg.get("From", ""))[:300],
            "to": str(msg.get("To", ""))[:300],
            "subject": str(msg.get("Subject", ""))[:300],
            "date": str(msg.get("Date", ""))[:150],
            "body": str(text)[:50_000],
        }

def send_mail(which, recipients, subject, body):
    user, password = account_config(which)
    if not isinstance(recipients, str) or len(recipients) > 400:
        raise ValueError("Destinatário inválido")
    if not isinstance(subject, str) or not 1 <= len(subject.strip()) <= 200 or "\n" in subject or "\r" in subject:
        raise ValueError("Assunto inválido")
    if not isinstance(body, str) or not 1 <= len(body.strip()) <= 15_000:
        raise ValueError("Texto inválido")
    addresses = getaddresses([recipients])
    if not 1 <= len(addresses) <= 5 or any(not EMAIL_RE.fullmatch(addr) or "\r" in name or "\n" in name for name, addr in addresses):
        raise ValueError("Use 1 a 5 endereços de e-mail válidos")
    to = [addr for _, addr in addresses]
    message = EmailMessage()
    message["From"] = user
    message["To"] = ", ".join(to)
    message["Subject"] = subject.strip()
    message.set_content(body)
    with smtplib.SMTP_SSL(HOST, port=465, context=ssl.create_default_context(), timeout=20) as smtp:
        smtp.login(user, password)
        smtp.send_message(message)
    return {"sent": True, "from": user, "to": to, "note": "O servidor SMTP aceitou a mensagem. A entrega final depende do destinatário."}

class handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        # Não registar URLs, credenciais nem textos de e-mail.
        pass

    def reply(self, status, data, cookie=None):
        raw = json.dumps(data, ensure_ascii=False).encode("utf-8")
        response_headers(self, status, cookie)
        self.wfile.write(raw)

    def require_session(self):
        if not cookie_ok(self.headers):
            self.reply(401, json_error("Sessão de correio expirada ou não autenticada"))
            return False
        return True

    def do_GET(self):
        url = urlsplit(self.path)
        params = parse_qs(url.query)
        mode = params.get("mode", ["status"])[0]
        if mode == "status":
            self.reply(200, {
                "authenticated": cookie_ok(self.headers),
                "serviceReady": bool(session_secret() and expected_password()),
                "accounts": {
                    name: bool(os.getenv(u) and os.getenv(p)) for name, (u, p) in ACCOUNTS.items()
                },
            })
            return
        if not self.require_session():
            return
        which = params.get("account", ["info"])[0]
        try:
            if mode == "list":
                self.reply(200, {"messages": mailbox_list(which)})
            elif mode == "read":
                uid = params.get("uid", [""])[0]
                self.reply(200, {"message": mailbox_read(which, uid)})
            else:
                self.reply(400, json_error("Operação desconhecida"))
        except ValueError as exc:
            self.reply(400, json_error(str(exc)))
        except Exception:
            self.reply(502, json_error("Não foi possível comunicar com o servidor de correio. Verifique a configuração do cPanel."))

    def do_POST(self):
        # O browser do painel envia Origin em POST; recusamos pedidos externos.
        origin = self.headers.get("Origin", "")
        host = self.headers.get("Host", "")
        if not origin or urlsplit(origin).netloc != host or urlsplit(origin).scheme not in ("https", "http"):
            self.reply(403, json_error("Origem não autorizada"))
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length < 1 or length > 20_000:
                raise ValueError("Pedido inválido")
            data = json.loads(self.rfile.read(length))
            if not isinstance(data, dict):
                raise ValueError("Pedido inválido")
        except (ValueError, json.JSONDecodeError):
            self.reply(400, json_error("Dados inválidos"))
            return
        mode = data.get("mode")
        if mode == "login":
            actual, secret = expected_password(), session_secret()
            attempt = data.get("password", "")
            if not actual or not secret:
                self.reply(503, json_error("Primeiro configure a palavra-passe e a chave de sessão na Vercel"))
                return
            if not isinstance(attempt, str) or not hmac.compare_digest(hashlib.sha256(attempt.encode()).digest(), hashlib.sha256(actual.encode()).digest()):
                self.reply(401, json_error("Palavra-passe incorrecta"))
                return
            self.reply(200, {"authenticated": True}, cookie=make_cookie())
            return
        if mode == "logout":
            self.reply(200, {"authenticated": False}, cookie=f"{COOKIE}=; Path=/api/vitaleevo_correio; Max-Age=0; HttpOnly; SameSite=Strict; Secure")
            return
        if not self.require_session():
            return
        if mode == "send":
            if data.get("confirmed") is not True:
                self.reply(400, json_error("É necessário confirmar explicitamente cada envio"))
                return
            try:
                result = send_mail(data.get("account", ""), data.get("to", ""), data.get("subject", ""), data.get("body", ""))
                self.reply(200, result)
            except ValueError as exc:
                self.reply(400, json_error(str(exc)))
            except Exception:
                self.reply(502, json_error("Falha no envio SMTP. Verifique a configuração e os registos do cPanel."))
            return
        self.reply(400, json_error("Operação desconhecida"))
