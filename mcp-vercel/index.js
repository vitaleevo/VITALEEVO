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
                version: "0.1.0",
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
            throw new Error("VERCEL_TOKEN environment variable is not set. Please set it in your environment or mcp_config.json.");
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
                            teamId: { type: "string", description: "Optional team ID if projects belong to a team." },
                        },
                    },
                },
                {
                    name: "get_project",
                    title: "Get Project Details",
                    description: "Retrieve details for a specific Vercel project by ID or name.",
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
                    name: "list_deployments",
                    title: "List Project Deployments",
                    description: "List recent deployments for a specific Vercel project.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            projectId: { type: "string", description: "The ID of the project." },
                            teamId: { type: "string", description: "Optional team ID." },
                            limit: { type: "number", description: "Max number of deployments to return (default 10).", default: 10 },
                        },
                        required: ["projectId"],
                    },
                },
                {
                    name: "get_deployment",
                    title: "Get Deployment Details",
                    description: "Retrieve full details and status for a specific Vercel deployment.",
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
                    name: "list_project_env_vars",
                    title: "List Project Environment Variables",
                    description: "List all configured environment variables for a Vercel project.",
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
