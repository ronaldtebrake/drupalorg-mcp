# Drupal.org MCP Server

This is a Model Context Protocol (MCP) server that provides an interface to the Drupal.org API. It allows AI models to interact with Drupal.org's data through a standardized interface.

## Features

- Search Drupal.org nodes with various filters
- Get project issues with status and priority filters
- Fetch security advisories
- MCP-compliant API endpoints

## Setup

1. Clone this repository:
```bash
git clone https://github.com/ronaldtebrake/drupalorg-mcp.git
cd drupalorg-mcp
```

2. Install dependencies and build:
```bash
npm install
npm run build
```

## IDE Configuration

### Cursor

1. Open Cursor settings (⌘+,)
2. Navigate to "AI & Copilot" settings
3. Scroll to "MCP Servers"
4. Add the following configuration:

```json
{
    "mcpServers": {
        "drupalorg": {
            "command": "node",
            "args": [
                "/ABSOLUTE/PATH/TO/drupalorg-mcp/dist/index.js"
            ]
        }
    }
}
```

Replace `/ABSOLUTE/PATH/TO` with the actual path to your project directory.

## Available Tools

### 1. search-nodes
Search for any content on Drupal.org.

Parameters:
- `type` (optional): Content type to filter by (e.g., "project_module", "project_theme")
- `field_issue_status` (optional): Issue status ID
- `field_issue_priority` (optional): Issue priority ID
- `limit` (optional): Number of results to return
- `page` (optional): Page number for pagination

Example usage in prompts:
```
Find all Drupal modules related to "commerce"
Search for critical security issues
List all case studies
```

### 2. get-issues
Get issues for a specific Drupal project.

Parameters:
- `projectName` (required): Machine name of the project (e.g., "drupal", "views", "commerce")
- `status` (optional): Issue status ID
  - 1: Active
  - 2: Fixed
  - 3: Closed (duplicate)
  - 4: Postponed
  - 8: Needs Review
  - 13: Needs Work
  - 14: Reviewed & Tested
- `priority` (optional): Issue priority ID
  - 400: Critical
  - 300: Major
  - 200: Normal
  - 100: Minor

Example usage in prompts:
```
Show me all critical issues for the Drupal project
Find needs review issues for the Views module
List all active issues for Commerce
```

### 3. get-security-advisories
Get security advisories with pagination.

Parameters:
- `limit` (optional): Number of results to return
- `page` (optional): Page number for pagination

Example usage in prompts:
```
Show me recent security advisories
List all security advisories from the last month
Find critical security updates
```

## Development

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build the TypeScript files
- `npm start`: Start the production server
