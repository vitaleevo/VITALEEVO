# Vercel MCP Server

Este é um servidor Model Context Protocol (MCP) que permite interagir com a API da Vercel.

## Funcionalidades (Tools)

- `list_projects`: Lista todos os projetos no Vercel.
- `get_project`: Obtém detalhes de um projeto específico.
- `list_deployments`: Lista os deployments de um projeto.
- `get_deployment`: Obtém detalhes de um deployment específico.
- `list_project_env_vars`: Lista as variáveis de ambiente de um projeto.

## Requisitos

- Node.js instalado.
- Um **Vercel Personal Access Token**. Você pode criar um em [vercel.com/account/tokens](https://vercel.com/account/tokens).

## Como Instalar e Executar

1. Entre no diretório:
   ```bash
   cd mcp-vercel
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Defina a variável de ambiente `VERCEL_TOKEN`:
   ```bash
   # Windows (PowerShell)
   $env:VERCEL_TOKEN="seu_token_aqui"
   
   # Linux/Mac/Bash
   export VERCEL_TOKEN="seu_token_aqui"
   ```
4. Inicie o servidor:
   ```bash
   npm start
   ```

## Configuração no Claude Desktop (ou outros clientes MCP)

Adicione a seguinte configuração ao seu arquivo `mcp_config.json`:

```json
{
  "mcpServers": {
    "vercel": {
      "command": "node",
      "args": ["C:/Users/alexa/Documents/GitHub/VITALEEVO/mcp-vercel/index.js"],
      "env": {
        "VERCEL_TOKEN": "seu_token_aqui"
      }
    }
  }
}
```
