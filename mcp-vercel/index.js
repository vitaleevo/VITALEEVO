import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";

const VERCEL_API_URL = "https://api.vercel.com";
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

class VercelMcpServer {
    constructor() {
        this.server = new Server(
            {
                name: "vercel-mcp-server",
                version: "0.3.0",
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupToolHandlers();
        this.server.onerror = (error) => console.error("[MCP Error]", error);
    }

    async fetchVercel(endpoint, options = {}) {
        if (!VERCEL_TOKEN) {
            throw new Error("VERCEL_TOKEN environment variable is not set.");
        }
        const url = `${VERCEL_API_URL}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                Authorization: `Bearer ${VERCEL_TOKEN}`,
                "Content-Type": "application/json",
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Vercel API error: ${response.status} ${JSON.stringify(errorData)}`);
        }

        return response.json();
    }

    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "list_projects",
                    title: "List Vercel Projects",
                    description: "List all projects in your Vercel account or team.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            teamId: { type: "string", description: "Optional team ID." },
                        },
                    },
                },
                {
                    name: "get_project",
                    title: "Get Project Details",
                    description: "Retrieve details for a specific Vercel project.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            idOrName: { type: "string", description: "The project's ID or name." },
                            teamId: { type: "string", description: "Optional team ID." },
                        },
                        required: ["idOrName"],
                    },
                },
                {
                    name: "add_project_domain",
                    title: "Add Custom Domain",
                    description: "Add a custom domain to a Vercel project.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            projectId: { type: "string", description: "The project ID or name." },
                            domain: { type: "string", description: "The domain name (e.g., example.com)." },
                            redirect: { type: "string", description: "Optional domain to redirect to." },
                            teamId: { type: "string", description: "Optional team ID." }
                        },
                        required: ["projectId", "domain"]
                    }
                },
                {
                    name: "create_deployment",
                    title: "Create New Deployment",
                    description: "Trigger a new deployment for a project.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            name: { type: "string", description: "The project name." },
                            gitSource: {
                                type: "object",
                                description: "The git source for the deployment.",
                                properties: {
                                    type: { type: "string", enum: ["github", "gitlab", "bitbucket"] },
                                    repoId: { type: "string", description: "The repository ID." },
                                    ref: { type: "string", description: "The branch or commit hash to deploy." }
                                },
                                required: ["type", "repoId", "ref"]
                            },
                            teamId: { type: "string", description: "Optional team ID." },
                            target: { type: "string", enum: ["production", "staging"] }
                        },
                        required: ["name"]
                    },
                },
                {
                    name: "list_deployments",
                    title: "List Project Deployments",
                    description: "List recent deployments for a specific project.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            projectId: { type: "string", description: "The ID of the project." },
                            teamId: { type: "string", description: "Optional team ID." },
                            limit: { type: "number", default: 10 },
                        },
                        required: ["projectId"],
                    },
                },
                {
                    name: "create_project_env_var",
                    title: "Create Environment Variable",
                    description: "Add a new environment variable to a Vercel project.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            projectId: { type: "string", description: "The project ID." },
                            key: { type: "string", description: "The name of the variable." },
                            value: { type: "string", description: "The value of the variable." },
                            type: { type: "string", enum: ["plain", "secret", "encrypted", "system"], default: "encrypted" },
                            target: {
                                type: "array",
                                items: { type: "string", enum: ["production", "preview", "development"] }
                            },
                            teamId: { type: "string", description: "Optional team ID." }
                        },
                        required: ["projectId", "key", "value", "target"]
                    }
                }
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case "list_projects": {
                        const endpoint = args.teamId ? `/v9/projects?teamId=${args.teamId}` : "/v9/projects";
                        const data = await this.fetchVercel(endpoint);
                        return {
                            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
                        };
                    }

                    case "get_project": {
                        const endpoint = args.teamId
                            ? `/v9/projects/${args.idOrName}?teamId=${args.teamId}`
                            : `/v9/projects/${args.idOrName}`;
                        const data = await this.fetchVercel(endpoint);
                        return {
                            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
                        };
                    }

                    case "add_project_domain": {
                        const endpoint = args.teamId
                            ? `/v9/projects/${args.projectId}/domains?teamId=${args.teamId}`
                            : `/v9/projects/${args.projectId}/domains`;
                        const body = {
                            name: args.domain,
                            redirect: args.redirect
                        };
                        const data = await this.fetchVercel(endpoint, {
                            method: "POST",
                            body: JSON.stringify(body)
                        });
                        return {
                            content: [{ type: "text", text: `Domain '${args.domain}' added to project ${args.projectId} successfully.` }],
                        };
                    }

                    case "create_deployment": {
                        const endpoint = args.teamId ? `/v13/deployments?teamId=${args.teamId}` : "/v13/deployments";
                        const body = {
                            name: args.name,
                            gitSource: args.gitSource,
                            target: args.target || "production"
                        };
                        const data = await this.fetchVercel(endpoint, {
                            method: "POST",
                            body: JSON.stringify(body)
                        });
                        return {
                            content: [{ type: "text", text: `Deployment created successfully!\nID: ${data.id}\nURL: ${data.url}` }],
                        };
                    }

                    case "create_project_env_var": {
                        const endpoint = args.teamId
                            ? `/v9/projects/${args.projectId}/env?teamId=${args.teamId}`
                            : `/v9/projects/${args.projectId}/env`;
                        const body = {
                            key: args.key,
                            value: args.value,
                            type: args.type || "encrypted",
                            target: args.target
                        };
                        const data = await this.fetchVercel(endpoint, {
                            method: "POST",
                            body: JSON.stringify(body)
                        });
                        return {
                            content: [{ type: "text", text: `Environment variable '${args.key}' created.` }],
                        };
                    }

                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
            } catch (error) {
                return {
                    content: [{ type: "text", text: `Error: ${error.message}` }],
                    isError: true,
                };
            }
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Vercel MCP server running on stdio");
    }
}

const server = new VercelMcpServer();
server.run().catch(console.error);
