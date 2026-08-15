# Checklist de Produção

## Antes do deploy

- Confirmar domínio, NEXT_PUBLIC_SITE_URL e SITE_URL como https://vitaleevo.ao.
- Configurar no Convex: RESEND_API_KEY, EMAIL_FROM, SITE_URL e VITALEEVO_API_KEYS_ENCRYPTION_KEY.
- Configurar no host Next.js: NEXT_PUBLIC_CONVEX_URL, CONVEX_URL, RESEND_API_KEY, EMAIL_FROM, CONTACT_EMAIL e NEWSLETTER_EMAIL.
- Verificar o domínio remetente no Resend. O valor de EMAIL_FROM deve usar esse domínio.
- Guardar todas as variáveis num cofre de segredos; nunca no Git.

## Publicação

1. Executar npm run typecheck, npm run lint e npm run build:app.
2. Publicar as functions do Convex com npx convex deploy.
3. Publicar a aplicação Next.js.
4. No painel /admin/ai, migrar as chaves antigas depois de configurar a chave de cifragem.
5. Confirmar que cada chave de IA aparece apenas mascarada no painel.

## Verificação pós-deploy

- Testar recuperação de senha e confirmar que nenhum token aparece no browser.
- Testar login, registo e alteração de senha.
- Abrir um produto destacado e confirmar a rota /store/<id>.
- Testar formulário de contacto, newsletter e checkout com e-mails de teste.
- Confirmar as páginas de artigos e portfólio com conteúdo HTML existente.
- Rever o console do navegador, sitemap e robots.txt.

## Operação

- Rodar dependabot ou npm audit em ambiente com acesso à internet.
- Criar backup/exportação regular dos dados Convex.
- Monitorizar falhas de e-mail e de APIs de IA.
- Rodar a rotação de chaves de IA pelo painel e remover chaves antigas quando necessário.
