/**
 * API Service Layer
 * Centralized API client for all backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiError {
  message: string;
  status: number;
  details?: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error: ApiError = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };

        try {
          const errorData = await response.json();
          error.details = errorData;
          error.message = errorData.message || error.message;
        } catch {
          // Response body is not JSON
        }

        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      
      // Network error or other fetch error
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
        details: error,
      } as ApiError;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async uploadFile<T>(endpoint: string, file: File): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for multipart/form-data
    });
  }
}

// Create singleton instance
const apiClient = new ApiClient(API_BASE_URL);

// Export API methods organized by resource
export const api = {
  // Health check
  health: {
    check: () => apiClient.get<{ status: string; timestamp: string }>('/health'),
  },

  // Guidelines API
  guidelines: {
    getAll: () =>
      apiClient.get<{
        guidelines: Array<{
          id: string;
          name: string;
          description: string;
          version: string;
          uploadedAt: string;
          fileSize: string;
          status: string;
        }>;
      }>('/guidelines'),
    
    getById: (id: string) =>
      apiClient.get<{
        id: string;
        name: string;
        description: string;
        version: string;
        uploadedAt: string;
        rules: any;
      }>(`/guidelines/${id}`),
    
    create: (data: {
      name: string;
      description: string;
      version: string;
    }) =>
      apiClient.post<{ id: string; message: string }>('/guidelines', data),
    
    update: (id: string, data: {
      name?: string;
      description?: string;
      version?: string;
    }) =>
      apiClient.put<{ message: string }>(`/guidelines/${id}`, data),
    
    delete: (id: string) =>
      apiClient.delete<{ message: string }>(`/guidelines/${id}`),
    
    uploadPdf: (file: File) =>
      apiClient.uploadFile<{ id: string; message: string }>(
        '/guidelines/upload',
        file
      ),
  },

  // Audits API
  audits: {
    getAll: (params?: { page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      
      return apiClient.get<{
        audits: Array<{
          id: string;
          url: string;
          status: string;
          score: number;
          createdAt: string;
          completedAt?: string;
        }>;
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>(`/audits?${query.toString()}`);
    },
    
    getById: (id: string) =>
      apiClient.get<{
        id: string;
        url: string;
        status: string;
        score: number;
        createdAt: string;
        guidelines: string[];
        screenshotUrl: string | null;
        pageDimensions: { width: number; height: number } | null;
        scores: {
          visual: number;
          component: number;
          content: number;
          accessibility: number;
        };
        summary: {
          totalIssues: number;
          criticalIssues: number;
          highIssues: number;
          mediumIssues: number;
          lowIssues: number;
        };
        issues: Array<{
          id: string;
          severity: string;
          category: string;
          title: string;
          description: string;
          location: string;
          recommendation: string;
          boundingBox: { x: number; y: number; width: number; height: number } | null;
        }>;
        metadata?: {
          duration?: number;
          aiCallsMade?: number;
          elementsAnalyzed?: number;
        };
      }>(`/audits/${id}`),
    
    create: (data: {
      url: string;
      depth: string;
      guidelines: string[];
      analysisTypes: string[];
      crawlOptions: {
        followExternalLinks: boolean;
        respectRobotsTxt: boolean;
        maxPages: number;
      };
      aiProvider: string;
    }) =>
      apiClient.post<{ id: string; message: string }>('/audits', data),
    
    getStatus: (id: string) =>
      apiClient.get<{
        id: string;
        status: string;
        progress: number;
        message: string;
      }>(`/audits/${id}/status`),
    
    cancel: (id: string) =>
      apiClient.post<{ message: string }>(`/audits/${id}/cancel`),
  },

  // Reports API
  reports: {
    getAll: () =>
      apiClient.get<{
        reports: Array<{
          id: string;
          auditId: string;
          format: 'pdf' | 'csv' | 'json';
          generatedAt: string;
          path: string;
        }>;
      }>('/reports'),
    
    getByAuditId: (auditId: string) =>
      apiClient.get<{
        reports: Array<{
          id: string;
          type: string;
          size: string;
          createdAt: string;
        }>;
      }>(`/reports/audit/${auditId}`),
    
    generatePdf: (auditId: string) =>
      apiClient.post<{ reportId: string; message: string }>(
        `/reports/${auditId}/pdf`
      ),
    
    generateCsv: (auditId: string) =>
      apiClient.post<{ reportId: string; message: string }>(
        `/reports/${auditId}/csv`
      ),
    
    download: (reportId: string) => {
      // For file downloads, we need to use a different approach
      window.location.href = `${API_BASE_URL}/reports/${reportId}/download`;
    },
    
    delete: (reportId: string) =>
      apiClient.delete<{ message: string }>(`/reports/${reportId}`),
  },
};

// Export error type for use in components
export type { ApiError };

// Made with Bob
