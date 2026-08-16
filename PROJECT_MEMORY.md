# Memória do Projeto VitalEvo

## Estado Atual

Código publicado em produção no domínio oficial e validado externamente. A trilha de publicação está concluída; permanecem validações operacionais de e-mail e chaves de IA.

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

## Última etapa concluída: Publicação web em produção — 2026-08-16

Objetivo: concluir o deploy autorizado do frontend e do backend, evitando o envio de artefactos locais para a Vercel.

Foi feito:

- Convex publicado em `https://merry-fennec-711.convex.cloud`.
- Variáveis de produção configuradas no projeto Vercel para domínio, contactos e endpoint Convex.
- Criado `.vercelignore` para excluir dependências, builds, repositório Git e materiais internos do envio.
- Publicado o commit `3701907` em `main`; a Vercel construiu e associou a versão ao domínio oficial.

Arquivos principais:

- `.vercelignore`
- `.gitignore`
- `PROJECT_MEMORY.md`

Verificação executada:

```bash
vercel inspect https://vitaleevo-h82os0xa8-vitaleevos-projects.vercel.app --scope vitaleevos-projects
curl -fsSIL https://vitaleevo.ao
curl -fsS https://vitaleevo.ao/contact
vercel logs https://vitaleevo-h82os0xa8-vitaleevos-projects.vercel.app --level error --since 1h --scope vitaleevos-projects
```

Resultado: deployment `Ready`, domínio `https://vitaleevo.ao` respondeu HTTP 200, contactos e layout novo presentes; sem erros nos logs Vercel.

Estado do projeto:

- Fase/trilha atual: publicação web concluída.
- Sólido agora: GitHub, Convex, Vercel e domínio oficial estão alinhados com a versão publicada.
- Falta imediato: confirmar a entrega de e-mails pelo Convex com `RESEND_API_KEY` e migrar as chaves de IA legadas no painel administrativo.
- Distância do fim: esta trilha está concluída; a operação contínua ainda requer validação real dos fluxos externos.

## Próximo Passo

Validar a entrega de e-mails e migrar as chaves de IA pelo painel administrativo.

AVISO: O proximo passo e criar/implementar a validacao operacional de e-mail e a migracao das chaves de IA. Antes de iniciar, leia `PROJECT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.
