# Vitaleevo Mail — cPanel / Vercel (sem Railway)

## Âmbito
- Página responsiva: /admin/correio
- API Python serverless: /api/vitaleevo_correio
- Recepção IMAP 993 e envio SMTP 465 via mail.vitaleevo.ao
- Contas: info@vitaleevo.ao e alexandre.macosso@vitaleevo.ao
- Área de correio tem sessão independente do backend Django para poder funcionar mesmo que Railway esteja inactivo.
- Não são alterados o DNS MX, o alojamento de e-mail, nem o site em produção nesta branch.

## Variáveis para Vercel — nunca colocar segredos em GitHub, no ChatGPT ou em NEXT_PUBLIC_*
Configurar no painel Vercel > vitaleevo > Settings > Environment Variables:

| Nome | Valor |
| --- | --- |
| VMAIL_HOST | mail.vitaleevo.ao |
| VMAIL_ADMIN_PASSWORD | Palavra-passe nova, exclusivamente do painel de correio, 16+ caracteres |
| VMAIL_SESSION_SECRET | Segredo aleatório de 32+ caracteres, não reutilizado |
| VMAIL_INFO_USER | info@vitaleevo.ao |
| VMAIL_INFO_PASSWORD | Palavra-passe da caixa, obtida pelo administrador no cPanel |
| VMAIL_ALEXANDRE_USER | alexandre.macosso@vitaleevo.ao |
| VMAIL_ALEXANDRE_PASSWORD | Palavra-passe da segunda caixa |

Atenção: usar as palavras-passe distintas de cada caixa. Não presumir que as credenciais de alexandre.macosso servem para info.

## Passos de homologação no telemóvel
1. Abrir o projecto Vercel e adicionar as variáveis no ambiente Preview da branch.
2. Verificar que o preview está protegido por Vercel Authentication/SSO.
3. Abrir URL preview + /admin/correio e entrar com VMAIL_ADMIN_PASSWORD.
4. Verificar leitura das mensagens em ambas as caixas IMAP.
5. Enviar um único e-mail de teste para um endereço sob controlo do proprietário, com confirmação explícita.
6. Confirmar entrega na caixa de destino e se aparece na pasta Enviados do Roundcube (o SMTP por si só não garante arquivo).
7. Testar logout, acesso não autenticado, caracteres especiais e limites de tamanho.
8. Configurar Vercel Firewall / rate limiting no endpoint de login antes de qualquer promoção para produção.
9. Só depois aprovar e mesclar a branch conforme PRODUCTION_CHECKLIST.md.

## Segurança e limites
- O conteúdo das mensagens é entregue ao browser apenas como texto simples, sem renderização de HTML ou anexos.
- As credenciais e secret nunca regressam na resposta da API nem são embutidos no frontend.
- Cookie HttpOnly, SameSite=Strict, HMAC e prazo de 4 horas; pedidos POST verificam origem.
- API permite no máximo 5 destinatários por envio e exige confirmação na interface.
- Funciona sob demanda; não mantém ligação IMAP persistente em Vercel Functions.
- Não há rascunhos persistentes nem histórico/auditoria independente; o envio não garante cópia na pasta Sent.
- A Vercel não bloqueia SMTP de saída na porta 465, mas a conectividade real ao servidor AngoWeb deve ser testada no preview.
- O backend principal Django permanece separado e não é alterado.
- **Não publicar produção sem rate limiting distribuído/WAF e homologação.**
- **Não concede automaticamente acesso ao ChatGPT por MCP.** Para automação directa no ChatGPT é necessária integração aprovada e autenticação apropriada.

## Limitação operacional
O formulário de correio é acessível mesmo que o login do resto do painel Django esteja indisponível. Essa separação é deliberada: a sessão de correio nunca autoriza acesso às outras rotas de /admin.
