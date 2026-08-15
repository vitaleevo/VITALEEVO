# Memória do Projeto VitalEvo

## Estado Atual

Código preparado para produção e validado localmente. A publicação permanece dependente apenas da configuração de segredos e da aprovação para deploy.

## Alterações Principais

- Recuperação de senha passa a gerar e enviar o token no backend Convex, sem devolvê-lo ao browser.
- Senhas exigem 12 caracteres com letras e números; pedidos de recuperação têm janela de 15 minutos.
- Conteúdo rico de artigos e portfólio é sanitizado antes de persistir e antes de renderizar.
- Chaves de IA passam a ser cifradas com AES-GCM, com migração das chaves legadas pelo painel administrativo.
- E-mails escapam conteúdo fornecido pelo utilizador e exigem remetente configurado.
- Corrigida a rota dos produtos destacados para /store/<id>.
- Melhorias de acessibilidade: zoom permitido, atalho para o conteúdo principal e FAQ semântico.
- Depoimentos, estatísticas e avaliações não verificadas foram removidos.
- Next.js 16 usa a convenção proxy e o sitemap é explicitamente dinâmico.
- Contactos públicos centralizados em src/shared/utils/contact.ts: +244 950 744 445, +244 924 197 009, info@vitaleevo.ao e localização em Benfica.
- Página de contacto e rodapé receberam layout responsivo renovado, ligações telefónicas, e-mail, WhatsApp e Google Maps.

## Validação Executada

- npx convex codegen: passou.
- npm run typecheck: passou.
- npm run lint: passou sem erros; mantém avisos de legado.
- npm run build:app: passou; 36 rotas geradas e sitemap dinâmico.
- Atualização de contactos (2026-08-16): npm run typecheck e npm run build:app passaram; npm run lint passou sem erros e manteve 136 avisos de legado.

## Atualização de Contactos — 2026-08-16

- O número principal de WhatsApp usado nos pedidos é +244 950 744 445.
- Os dados estruturados do site usam a morada e telefone oficiais.

## Próximo Passo

Configurar os segredos no Convex e no host Next.js, migrar as chaves de IA pelo painel e executar o deploy autorizado.
