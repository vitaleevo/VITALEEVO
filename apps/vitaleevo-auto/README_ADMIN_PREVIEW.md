# Vitaleevo Auto — Administração Convex (trabalho em curso)

Estado em 22-11-2026

- Projecto Vercel: vitaleevo-auto
- Domínio público de produção: https://auto.vitaleevo.ao (inalterado)
- Versão de testes do painel: https://vitaleevo-auto-lihj60xd6-vitaleevos-projects.vercel.app/admin
- Deployment de testes: dpl_47FUUAtiXoySMq3neAYBMGKqkUoJ — READY
- A versão de testes contém os módulos React do admin, schema Convex, autenticação Convex Auth 2.1 e configuração de Resend, mas **o Convex e Resend ainda não estão ligados**.
- A Vercel protege o preview: o URL pode exigir login na Vercel.
- O GitHub nesta branch contém documentação e ficheiros iniciais de suporte, mas **não é ainda a cópia completa e executável do código que está no deployment da Vercel**.

Bloqueios para activar:
1. Proprietário deve iniciar sessão na conta Convex e criar o projecto dedicado vitaleevo-auto.
2. Configurar URL Convex na Vercel (NEXT_PUBLIC_CONVEX_URL) e publicar funções com Convex CLI.
3. Proprietário deve iniciar sessão no Resend, verificar um subdomínio remetente e configurar RESEND_API_KEY exclusivamente nas variáveis privadas do Convex.
4. Criar e verificar conta info@vitaleevo.ao e atribuir manualmente perfil de Super Administrador na função interna Convex, nunca pelo frontend.
5. Migrar 8 produtos e homologar permissões; só depois promover a produção.

WhatsApp comercial: +244 924 197 009.
Correio institucional: info@vitaleevo.ao.
O site público e o formulário B2B em Vercel Blob não foram alterados.
