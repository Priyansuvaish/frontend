import { FormTemplate } from '@/types/form-template';
import { getAuthHeaders,handleSignOut } from "../app/utils/auth";

export class FormTemplateService {
    static async getAll(accessToken: string): Promise<FormTemplate[]> {
      console.log('FormTemplateService.getAll called');
      console.log('Access token present:', !!accessToken);
      console.log('Access token length:', accessToken.length);
      console.log('Access token starts with:', accessToken.substring(0, 20));
      
      const headers = getAuthHeaders(accessToken);
      console.log('GET request headers:', headers);
      console.log('Authorization header value:', (headers as Record<string, string>).Authorization);
      
      const response = await fetch('/api/form-templates', {
        headers: headers,
      });

      console.log('GET response status:', response.status);
      console.log('GET response ok:', response.ok);
      console.log('GET response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        if (response.status === 401) {
          const errorText = await response.text();
          console.log('GET 401 error response:', errorText);
          handleSignOut();
          throw new Error('UNAUTHORIZED');
        }
        if (response.status === 403) {
          const errorText = await response.text();
          console.log('GET 403 error response:', errorText);
          throw new Error('Access forbidden. Please check your permissions.');
        }
        const errorText = await response.text();
        console.log('GET error response body:', errorText);
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('GET successful, templates count:', data.length);
      return data;
    }
  
    static async getById(id: number, accessToken: string): Promise<FormTemplate> {
      const response = await fetch(`/api/form-templates/${id}`, {
        headers: getAuthHeaders(accessToken),
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          handleSignOut();
          throw new Error('UNAUTHORIZED');
        }
        if (response.status === 404) throw new Error('Template not found');
        throw new Error(`Failed to fetch template: ${response.statusText}`);
      }
  
      return response.json();
    }
  
    static async create(template: Omit<FormTemplate, 'id'>, accessToken: string): Promise<FormTemplate> {
      const response = await fetch('/api/form-templates', {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify(template),
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          handleSignOut();
          throw new Error('UNAUTHORIZED');
        }
        throw new Error(`Failed to create template: ${response.statusText}`);
      }
  
      return response.json();
    }
  
    static async update(id: number, template: Omit<FormTemplate, 'id'>, accessToken: string): Promise<FormTemplate> {
      console.log('FormTemplateService.update called with ID:', id);
      console.log('Access token present:', !!accessToken);
      console.log('Access token value:', accessToken.substring(0, 20) + '...');
      
      const headers = getAuthHeaders(accessToken);
      console.log('Request headers:', headers);
      
      const response = await fetch(`/api/form-templates/${id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(template),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        if (response.status === 401) {
          handleSignOut();
          throw new Error('UNAUTHORIZED');
        }
        if (response.status === 404) throw new Error('Template not found');
        const errorText = await response.text();
        console.log('Error response body:', errorText);
        throw new Error(`Failed to update template: ${response.statusText}`);
      }

      return response.json();
    }
  
    static async delete(id: number, accessToken: string): Promise<void> {
      const response = await fetch(`/api/form-templates/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(accessToken),
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          handleSignOut();
          throw new Error('UNAUTHORIZED');
        }
        if (response.status === 404) throw new Error('Template not found');
        throw new Error(`Failed to delete template: ${response.statusText}`);
      }
    }
  
    static validateJsonSchema(schemaJson: string): Record<string, unknown> {
      try {
        return JSON.parse(schemaJson);
      } catch {
        throw new Error('Invalid JSON schema format');
      }
    }
  }
  