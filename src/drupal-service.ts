import axios from 'axios';
import {
  DrupalNode,
  DrupalIssue,
  DrupalApiResponse,
  SearchNodesParams,
  GetIssuesParams,
  GetSecurityAdvisoriesParams,
} from './types.js';

export class DrupalService {
  private baseUrl = 'https://www.drupal.org/api-d7';

  constructor() {
    axios.defaults.headers.common['Accept'] = 'application/json';
  }

  async getNode(nid: string): Promise<DrupalNode> {
    const response = await axios.get(`${this.baseUrl}/node/${nid}.json`);
    return response.data;
  }

  async searchNodes(params: SearchNodesParams): Promise<DrupalApiResponse<DrupalNode>> {
    const response = await axios.get(`${this.baseUrl}/node.json`, { params });
    return response.data;
  }

  async getIssues(projectName: string, params: Partial<GetIssuesParams> = {}): Promise<DrupalApiResponse<DrupalIssue>> {
    const searchParams = {
      type: 'project_issue',
      field_project_machine_name: projectName,
      ...params,
    };
    const response = await axios.get(`${this.baseUrl}/node.json`, { params: searchParams });
    return response.data;
  }

  async getSecurityAdvisories(params: GetSecurityAdvisoriesParams = {}): Promise<DrupalApiResponse<DrupalNode>> {
    const searchParams = {
      type: 'sa',
      status: 1,
      ...params,
    };
    const response = await axios.get(`${this.baseUrl}/node.json`, { params: searchParams });
    return response.data;
  }
} 