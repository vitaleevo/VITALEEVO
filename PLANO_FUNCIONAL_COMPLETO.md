# Plano de conclusão funcional — VitalEvo

Data: 29 de agosto de 2026

## Objetivo

Entregar uma plataforma em que o conteúdo e o catálogo sejam geridos no painel administrativo com CRUD completo, com permissões por função, e em que cada alteração publicada seja refletida de forma confiável no site institucional, no catálogo e nas áreas de conta relevantes.

## Definição de pronto

Uma funcionalidade só é considerada concluída quando cumpre todos os itens abaixo:

- criar, listar, consultar, editar, publicar/despublicar e arquivar/remover de acordo com a regra do domínio;
- validar dados no frontend e no backend, com mensagens compreensíveis;
- respeitar autenticação, permissões e propriedade dos dados;
- refletir no site público apenas o que está publicado/ativo;
- refletir na conta do cliente quando o registo lhe pertence (pedidos, cotações, favoritos, moradas, notificações e perfil);
- ter auditoria das alterações administrativas importantes;
- ter testes de API e testes de jornada no navegador.

## Estado de partida apurado

- Já existem rotas e telas administrativas para blog, portfólio, produtos, categorias, marcas, serviços, CMS, clientes, pedidos, cotações, contactos e newsletter.
- Blog, portfólio e produtos já possuem uma base de CRUD e filtros públicos por estado publicado/ativo.
- A conta do cliente já tem perfil, segurança, pedidos, moradas, favoritos e notificações.
- Existe uma lacuna crítica de contrato no portfólio: a interface administra campos como cliente, ano, ordem e descrição longa, mas o modelo atual não persiste todos eles. Esta inconsistência deve ser eliminada antes de considerar o módulo funcional.
- O repositório contém alterações locais em curso. Nenhuma fase deve sobrescrevê-las; primeiro será preciso incorporá-las ou isolá-las com segurança.

## Fase 0 — Consolidação e contrato de dados

Objetivo: estabelecer uma única fonte de verdade entre base de dados, API, painel e páginas públicas.

1. Inventariar cada campo exibido/formulário de Blog, Portfólio, Produtos, Serviços, páginas institucionais, Conta e Pedidos.
2. Criar uma matriz de propriedade e visibilidade: público, cliente dono, equipa por função e administrador.
3. Corrigir modelos, migrações e esquemas de validação para que nenhum campo aceite pela interface seja descartado silenciosamente.
4. Padronizar estados: `draft`, `published`, `archived` para conteúdo; `active`/`inactive` para catálogo; transições controladas para pedido e cotação.
5. Definir regras de remoção: conteúdo e catálogo devem preferir arquivamento; apagamento definitivo só para dados sem vínculo operacional e com confirmação.

Critério de aceite: um teste automatizado prova que cada campo salvo pelo painel é devolvido pela API e permanece após reinício da aplicação.

## Fase 1 — CMS público: Blog, Portfólio e Institucional

### Blog

- CRUD completo de artigos com editor rico seguro, capa, categoria, resumo, SEO, autor, data de publicação, destaque e estados.
- Pré-visualização antes de publicar; URL por slug único; redirecionamento quando um slug publicado for alterado.
- Página de listagem com paginação, pesquisa/categoria e apenas artigos publicados; página individual com metadados e conteúdos sanitizados.
- Itens em destaque devem alimentar automaticamente as secções institucionais que exibem artigos.

### Portfólio

- Persistir e expor: título, slug, cliente, ano, categoria, imagem/galeria, descrição curta, estudo de caso completo, resultados, tecnologias, ordem, destaque e estado.
- CRUD administrativo com upload/seleção de imagens, reordenação e pré-visualização.
- Listagem pública filtrável e página de caso individual. Apenas projetos publicados aparecem; destaques alimentam a homepage e demais blocos institucionais.
- Garantir links quebrados, imagens ausentes e projetos arquivados retornam estados corretos (404 ou exclusão da vitrine).

### Páginas institucionais e serviços

- Converter textos, CTAs, blocos, imagens, SEO e ordem de secções em conteúdo administrável, preservando o desenho atual.
- CRUD de serviços, páginas legais e blocos de páginas; rascunho/publicação e histórico mínimo de alterações.
- Qualquer serviço, artigo ou projeto marcado como destaque deve aparecer automaticamente nas áreas institucionais configuradas, sem duplicação manual de texto.

Critério de aceite: uma pessoa de Conteúdo publica um artigo, projeto ou serviço no painel e ele aparece no site público correto após atualização, sem acesso a dados privados.

## Fase 2 — Produtos e catálogo comercial

1. Completar CRUD de produtos, categorias, subcategorias e marcas: SKU único, nome, slug, descrição, imagens/galeria, ficha técnica, preço/modalidade de cotação, stock, destaque e estado.
2. Validar relações categoria/subcategoria, prevenção de categorias cíclicas e bloqueio de duplicidade de SKU/slug.
3. Implementar gestão de media segura: tipo/tamanho de ficheiro, armazenamento privado/origem autorizada, miniaturas e remoção referencialmente segura.
4. Exibir no catálogo público apenas produtos ativos/publicados, com pesquisa, filtros e páginas individuais atualizadas a partir da API.
5. Registar ajustes de stock, motivo, utilizador e data; impedir stock negativo em fluxos que reservem mercadoria.
6. Integrar produto com favoritos, carrinho/cotação e encomenda, preservando no pedido uma fotografia do item, preço/condições e quantidade daquele momento.

Critério de aceite: produto criado, editado, desativado e arquivado no painel altera imediatamente o catálogo; uma cotação/pedido conserva os itens corretos e só é visível ao respetivo cliente e à equipa autorizada.

## Fase 3 — Área da conta e fluxos comerciais

1. Perfil e segurança: atualização de dados, alteração/recuperação de palavra-passe, sessões e encerramento seguro de sessão.
2. Moradas: CRUD completo, uma predefinida por utilizador e validação de formato.
3. Favoritos e carrinho: adicionar/remover, quantidade válida, sincronização com a conta autenticada e tratamento de produto indisponível.
4. Cotações: criar a partir do catálogo, acompanhar estado, ver proposta e histórico próprio; notificações por mudança de estado.
5. Pedidos: checkout/cotação convertido em pedido conforme o modelo comercial definido, detalhes, estado, comprovativos e notificações. Nunca expor um pedido por ID a outro cliente.
6. Notificações: listar, marcar como lida e ligar a pedido, cotação ou ação relevante.

Critério de aceite: um cliente novo percorre cadastro → produto → cotação/pedido → acompanhamento na conta, e uma segunda conta não consegue ler nem alterar nenhum dado da primeira.

## Fase 4 — Backoffice, permissões e operação

1. Confirmar matriz de funções: Administrador, Conteúdo, Comercial, Operações e Cliente. As permissões precisam ser aplicadas na API, não apenas escondidas no menu.
2. Painel por domínio: Conteúdo gere blog/portfólio/páginas; Comercial gere cotações/contactos; Operações gere produtos/stock/pedidos; Admin gere utilizadores, permissões e configurações.
3. Dashboard com métricas de cada função e dados autorizados apenas.
4. Auditoria imutável de criação, edição, publicação, arquivamento, alteração de stock e mudança de estado comercial.
5. Importação/exportação controlada para catálogo e conteúdo, com pré-validação, relatório de erros e rollback em lote quando necessário.

Critério de aceite: testes de autorização tentam cada rota sensível com todos os papéis e confirmam acesso somente ao papel correto.

## Fase 5 — Qualidade, segurança e lançamento

1. Testes unitários de validação, estados e autorização; testes de integração para todos os CRUDs; testes end-to-end das jornadas pública, conteúdo, comercial, operações e cliente.
2. Testes específicos de reflexo de dados: criar/editar/publicar/arquivar no painel e validar listagem/detalhe público e conta do cliente.
3. Paginação, pesquisa, limites de upload, sanitização de HTML, controlo de taxa, logs sem dados sensíveis, backups e restauração testada.
4. Acessibilidade, responsividade e SEO: metadados dinâmicos, sitemap com conteúdo publicado, páginas 404 e desempenho de imagens.
5. Homologação em staging com cópia anonimizada; migrações versionadas; plano de rollback; monitorização de erros e saúde após deploy.

Critério de aceite: CI verde, migrações verificadas, testes E2E aprovados, revisão manual mobile/desktop concluída e checklist de produção assinado.

## Ordem recomendada de implementação

1. Fase 0: contrato, migrações e correção do portfólio.
2. Fase 1: blog e portfólio completos, depois páginas/serviços institucionais.
3. Fase 2: catálogo e media.
4. Fase 3: conta, cotações e pedidos.
5. Fase 4: permissões, auditoria e importação.
6. Fase 5: regressão, segurança e lançamento.

## Marcos demonstráveis

- Marco A: CMS confiável — Blog, Portfólio e Serviços publicados no painel surgem no site.
- Marco B: Catálogo confiável — Produtos e stock são administrados, pesquisáveis e utilizáveis em cotação/pedido.
- Marco C: Cliente autónomo — Conta apresenta todos os dados próprios e recebe atualizações do negócio.
- Marco D: Operação segura — equipa trabalha por permissões, alterações são auditadas e a plataforma passa a matriz de regressão.

## Decisões que precisam ser fechadas antes da Fase 3

- A loja continuará como catálogo para cotação ou haverá pagamento online? Isso altera checkout, estados de pedido, pagamentos e reconciliação.
- Quais dados de um projeto do portfólio são obrigatórios para a VitalEvo (cliente, resultado, autorização de uso de marca/imagem)?
- Quem poderá publicar conteúdo diretamente e quem apenas prepara rascunhos?
