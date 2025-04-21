import { z } from 'zod';

// Zod schemas for validation
export const DrupalNodeSchema = z.object({
  nid: z.string(),
  type: z.string(),
  title: z.string(),
  created: z.number(),
  changed: z.number(),
  status: z.number(),
}).passthrough();

export const DrupalIssueSchema = DrupalNodeSchema.extend({
  field_issue_status: z.number(),
  field_issue_priority: z.number(),
  field_issue_category: z.number(),
});

export const DrupalApiResponseSchema = z.object({
  list: z.array(z.any()),
  self: z.string(),
  first: z.string(),
  last: z.string(),
  count: z.number(),
});

// Parameter schemas for MCP tools
export const SearchNodesParamsSchema = z.object({
  type: z.string().optional().describe("Content type to filter by"),
  field_issue_status: z.number().optional().describe("Issue status ID"),
  field_issue_priority: z.number().optional().describe("Issue priority ID"),
  limit: z.number().optional().describe("Number of results to return"),
  page: z.number().optional().describe("Page number for pagination"),
}).passthrough();

export const GetIssuesParamsSchema = z.object({
  projectName: z.string().describe("Machine name of the project"),
  status: z.number().optional().describe("Issue status ID"),
  priority: z.number().optional().describe("Issue priority ID"),
});

export const GetSecurityAdvisoriesParamsSchema = z.object({
  limit: z.number().optional().describe("Number of results to return"),
  page: z.number().optional().describe("Page number for pagination"),
});

// TypeScript types inferred from schemas
export type DrupalNode = z.infer<typeof DrupalNodeSchema>;
export type DrupalIssue = z.infer<typeof DrupalIssueSchema>;
export type DrupalApiResponse<T> = Omit<z.infer<typeof DrupalApiResponseSchema>, 'list'> & { list: T[] };
export type SearchNodesParams = z.infer<typeof SearchNodesParamsSchema>;
export type GetIssuesParams = z.infer<typeof GetIssuesParamsSchema>;
export type GetSecurityAdvisoriesParams = z.infer<typeof GetSecurityAdvisoriesParamsSchema>; 