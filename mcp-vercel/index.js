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
                version: "0.2.0",
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
                    name: "create_deployment",
                    title: "Create New Deployment",
                    description: "Trigger a new deployment for a project. Useful for re-deploying a branch or a specific commit.",
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
                                    ref: { type: "string", description: "The branch or commit hash to deploy (e.g., 'main')." }
                                },
                                required: ["type", "repoId", "ref"]
                            },
                            teamId: { type: "string", description: "Optional team ID." },
                            target: { type: "string", enum: ["production", "staging"], description: "The target environment (default: production)." }
                        },
                        required: ["name"]
                    },
                },
                {
                    name: "list_deployments",
                    title: "List Project Deployments",
                    description: "List recent deployments for a specific Vercel project.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            projectId: { type: "string", description: "The ID of the project." },
                            teamId: { type: "string", description: "Optional team ID." },
                            limit: { type: "number", description: "Max deployments to return.", default: 10 },
                        },
                        required: ["projectId"],
                    },
                },
                {
                    name: "get_deployment",
                    title: "Get Deployment Details",
                    description: "Retrieve details for a specific deployment.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            deploymentId: { type: "string", description: "The unique ID of the deployment." },
                            teamId: { type: "string", description: "Optional team ID." },
                        },
                        required: ["deploymentId"],
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
                            key: { type: "string", description: "The name of the variable (e.g., API_KEY)." },
                            value: { type: "string", description: "The value of the variable." },
                            type: { type: "string", enum: ["plain", "secret", "encrypted", "system"], default: "encrypted" },
                            target: {
                                type: "array",
                                items: { type: "string", enum: ["production", "preview", "development"] },
                                description: "Environments where this variable will be available."
                            },
                            teamId: { type: "string", description: "Optional team ID." }
                        },
                        required: ["projectId", "key", "value", "target"]
                    }
                },
                {
                    name: "list_project_env_vars",
                    title: "List Environment Variables",
                    description: "List all configured environment variables for a project.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            projectId: { type: "string", description: "The project ID." },
                            teamId: { type: "string", description: "Optional team ID." },
                        },
                        required: ["projectId"],
                    },
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
                            content: [{ type: "text", text: `Deployment created successfully!\nID: ${data.id}\nURL: ${data.url}\nStatus: ${data.status}` }],
                        };
                    }

                    case "list_deployments": {
                        let endpoint = `/v6/deployments?projectId=${args.projectId}`;
                        if (args.teamId) endpoint += `&teamId=${args.teamId}`;
                        if (args.limit) endpoint += `&limit=${args.limit}`;
                        const data = await this.fetchVercel(endpoint);
                        return {
                            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
                        };
                    }

                    case "get_deployment": {
                        const endpoint = args.teamId
                            ? `/v13/deployments/${args.deploymentId}?teamId=${args.teamId}`
                            : `/v13/deployments/${args.deploymentId}`;
                        const data = await this.fetchVercel(endpoint);
                        return {
                            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
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
                            content: [{ type: "text", text: `Environment variable '${args.key}' created for project ${args.projectId}.` }],
                        };
                    }

                    case "list_project_env_vars": {
                        const endpoint = args.teamId
                            ? `/v9/projects/${args.projectId}/env?teamId=${args.teamId}`
                            : `/v9/projects/${args.projectId}/env`;
                        const data = await this.fetchVercel(endpoint);
                        return {
                            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
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
