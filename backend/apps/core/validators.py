"""Validadores centrais — espelham convex/validation.ts (regras iguais, backend único)."""
import re

from django.core.exceptions import ValidationError

SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
PHONE_PATTERN = re.compile(r"^\+?[0-9][0-9\s-]{6,19}$")
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def normalize_email(email: str) -> str:
    """E-mail normalizado e validado (minúsculas, sem espaços)."""
    normalized = email.strip().lower()
    if not EMAIL_PATTERN.fullmatch(normalized):
        raise ValidationError("E-mail inválido")
    return normalized


def validate_phone(phone: str) -> str:
    """Telefone normalizado e validado (ex.: +244 923 000 000)."""
    normalized = phone.strip()
    if not PHONE_PATTERN.fullmatch(normalized):
        raise ValidationError("Telefone inválido")
    return normalized


def validate_slug(value: str) -> str:
    """Slug em minúsculas com hífen (ex.: sistema-gestor)."""
    normalized = value.strip().lower()
    if not SLUG_PATTERN.fullmatch(normalized):
        raise ValidationError("Slug inválido. Use letras minúsculas, números e hífen.")
    return normalized


def validate_positive_quantity(quantity: int) -> int:
    """Quantidade inteira entre 1 e 999."""
    if not isinstance(quantity, int) or quantity < 1 or quantity > 999:
        raise ValidationError("Quantidade inválida")
    return quantity


def validate_text(value: str, field: str, max_length: int) -> str:
    """Texto obrigatório com limite de caracteres — mensagem clara para o utilizador."""
    normalized = value.strip()
    if not normalized:
        raise ValidationError(f"{field} é obrigatório")
    if len(normalized) > max_length:
        raise ValidationError(f"{field} não pode exceder {max_length} caracteres")
    return normalized


def sanitize_html(value: str | None) -> str:
    """Sanitiza HTML rico defense-in-depth com nh3 (compatível TipTap)."""
    if not value:
        return ""
    try:
        import nh3
        return nh3.clean(
            value,
            tags={"a","abbr","address","article","aside","b","blockquote","br","cite","code","del","details","div","em","figcaption","figure","footer","h1","h2","h3","h4","h5","h6","header","hr","i","img","ins","kbd","li","main","mark","ol","p","pre","q","s","samp","section","small","span","strong","sub","summary","sup","table","tbody","td","th","thead","time","tr","u","ul","var"},
            attributes={"a": {"href","title","target","class"}, "img": {"src","alt","title","class"}, "*": {"class","id"}},
            url_schemes={"http","https","mailto"},
            link_rel="noopener noreferrer",
            clean_content_tags={"script","style"},
            strip_comments=True,
        )
    except Exception:
        # fallback: escapa tudo se nh3 falhar
        import html
        return html.escape(value)