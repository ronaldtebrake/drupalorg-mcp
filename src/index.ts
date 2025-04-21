import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import { z } from "zod";
import {
  DrupalNode,
  DrupalIssue,
  DrupalApiResponse,
} from "./types.js";

const DRUPAL_API_BASE = "https://www.drupal.org/api-d7";
const USER_AGENT = "drupalorg-mcp/1.0";

// Create server instance
const server = new McpServer({
  name: "drupalorg",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Helper function for making Drupal.org API requests
async function makeDrupalRequest<T>(path: string, params: Record<string, any> = {}): Promise<T | null> {
  const headers = {
    "User-Agent": USER_AGENT,
    "Accept": "application/json",
  };

  try {
    const response = await axios.get(`${DRUPAL_API_BASE}/${path}`, {
      headers,
      params,
    });
    return response.data as T;
  } catch (error) {
    console.error("Error making Drupal.org request:", error);
    return null;
  }
}

// Format node data for display
function formatNode(node: DrupalNode): string {
  return [
    `Title: ${node.title}`,
    `Type: ${node.type}`,
    `Created: ${new Date(node.created * 1000).toISOString()}`,
    `Changed: ${new Date(node.changed * 1000).toISOString()}`,
    "---",
  ].join("\n");
}

// Format issue data for display
function formatIssue(issue: DrupalIssue): string {
  const statusMap: Record<number, string> = {
    1: "Active",
    2: "Fixed",
    3: "Closed (duplicate)",
    4: "Postponed",
    8: "Needs Review",
    13: "Needs Work",
    14: "Reviewed & Tested",
  };

  const priorityMap: Record<number, string> = {
    400: "Critical",
    300: "Major",
    200: "Normal",
    100: "Minor",
  };

  return [
    `Title: ${issue.title}`,
    `Status: ${statusMap[issue.field_issue_status] || "Unknown"}`,
    `Priority: ${priorityMap[issue.field_issue_priority] || "Unknown"}`,
    `Created: ${new Date(issue.created * 1000).toISOString()}`,
    `Changed: ${new Date(issue.changed * 1000).toISOString()}`,
    "---",
  ].join("\n");
}

// Define parameter types for tools
const searchNodesParams = {
  type: z.string().optional(),
  field_issue_status: z.number().optional(),
  field_issue_priority: z.number().optional(),
  limit: z.number().optional(),
  page: z.number().optional(),
} as const;

const getIssuesParams = {
  projectName: z.string(),
  status: z.number().optional(),
  priority: z.number().optional(),
} as const;

const getSecurityAdvisoriesParams = {
  limit: z.number().optional(),
  page: z.number().optional(),
} as const;

// Register Drupal.org tools
server.tool(
  "search-nodes",
  "Search for nodes on Drupal.org",
  searchNodesParams,
  async (params) => {
    const data = await makeDrupalRequest<DrupalApiResponse<DrupalNode>>("node.json", params);

    if (!data) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve nodes",
          },
        ],
      };
    }

    if (data.list.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No nodes found matching the criteria",
          },
        ],
      };
    }

    const formattedNodes = data.list.map(formatNode);
    return {
      content: [
        {
          type: "text",
          text: `Found ${data.count} nodes:\n\n${formattedNodes.join("\n")}`,
        },
      ],
    };
  },
);

server.tool(
  "get-issues",
  "Get issues for a Drupal project",
  getIssuesParams,
  async ({ projectName, status, priority }) => {
    const params = {
      type: "project_issue",
      field_project_machine_name: projectName,
      field_issue_status: status,
      field_issue_priority: priority,
    };

    const data = await makeDrupalRequest<DrupalApiResponse<DrupalIssue>>("node.json", params);

    if (!data) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve issues",
          },
        ],
      };
    }

    if (data.list.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No issues found for project: ${projectName}`,
          },
        ],
      };
    }

    const formattedIssues = data.list.map(formatIssue);
    return {
      content: [
        {
          type: "text",
          text: `Found ${data.count} issues for ${projectName}:\n\n${formattedIssues.join("\n")}`,
        },
      ],
    };
  },
);

server.tool(
  "get-security-advisories",
  "Get security advisories",
  getSecurityAdvisoriesParams,
  async (params) => {
    const searchParams = {
      type: "sa",
      status: 1,
      ...params,
    };

    const data = await makeDrupalRequest<DrupalApiResponse<DrupalNode>>("node.json", searchParams);

    if (!data) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve security advisories",
          },
        ],
      };
    }

    if (data.list.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No security advisories found",
          },
        ],
      };
    }

    const formattedAdvisories = data.list.map(formatNode);
    return {
      content: [
        {
          type: "text",
          text: `Found ${data.count} security advisories:\n\n${formattedAdvisories.join("\n")}`,
        },
      ],
    };
  },
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Drupal.org MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
}); 