import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
}

/**
 * Custom hook for API calls with loading and error states
 * @param apiCall - Function that returns a Promise
 * @param dependencies - Array of dependencies to trigger refetch
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as ApiError });
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    ...state,
    refetch: fetchData,
  };
}

/**
 * Hook for fetching all audits
 */
export function useAudits(page = 1, limit = 10) {
  return useApi(() => api.audits.getAll({ page, limit }), [page, limit]);
}

/**
 * Hook for fetching a single audit by ID
 */
export function useAudit(id: string) {
  return useApi(() => api.audits.getById(id), [id]);
}

/**
 * Hook for fetching all guidelines
 */
export function useGuidelines() {
  return useApi(() => api.guidelines.getAll(), []);
}

/**
 * Hook for fetching a single guideline by ID
 */
export function useGuideline(id: string) {
  return useApi(() => api.guidelines.getById(id), [id]);
}

/**
 * Hook for fetching all reports
 */
export function useReports() {
  return useApi(() => api.reports.getAll(), []);
}

/**
 * Hook for fetching reports by audit ID
 */
export function useReportsByAudit(auditId: string) {
  return useApi(() => api.reports.getByAuditId(auditId), [auditId]);
}

/**
 * Hook for mutation operations (POST, PUT, DELETE)
 */
export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>
) {
  const [state, setState] = useState<{
    data: TData | null;
    loading: boolean;
    error: ApiError | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (variables: TVariables) => {
      setState({ data: null, loading: true, error: null });
      
      try {
        const data = await mutationFn(variables);
        setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        setState({ data: null, loading: false, error: error as ApiError });
        throw error;
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

/**
 * Hook for creating a new audit
 */
export function useCreateAudit() {
  return useMutation((data: Parameters<typeof api.audits.create>[0]) =>
    api.audits.create(data)
  );
}

/**
 * Hook for creating a new guideline
 */
export function useCreateGuideline() {
  return useMutation((data: Parameters<typeof api.guidelines.create>[0]) =>
    api.guidelines.create(data)
  );
}

/**
 * Hook for updating a guideline
 */
export function useUpdateGuideline() {
  return useMutation(
    ({ id, data }: { id: string; data: Parameters<typeof api.guidelines.update>[1] }) =>
      api.guidelines.update(id, data)
  );
}

/**
 * Hook for deleting a guideline
 */
export function useDeleteGuideline() {
  return useMutation((id: string) => api.guidelines.delete(id));
}

/**
 * Hook for generating PDF report
 */
export function useGeneratePdfReport() {
  return useMutation((auditId: string) => api.reports.generatePdf(auditId));
}

/**
 * Hook for generating CSV report
 */
export function useGenerateCsvReport() {
  return useMutation((auditId: string) => api.reports.generateCsv(auditId));
}

/**
 * Hook for polling audit status
 */
export function useAuditStatus(auditId: string, interval = 2000) {
  const [status, setStatus] = useState<{
    id: string;
    status: string;
    progress: number;
    message: string;
  } | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (!auditId) return;

    const pollStatus = async () => {
      try {
        const data = await api.audits.getStatus(auditId);
        setStatus(data);
        
        // Stop polling if audit is completed or failed
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(intervalId);
        }
      } catch (err) {
        setError(err as ApiError);
        clearInterval(intervalId);
      }
    };

    // Initial fetch
    pollStatus();

    // Set up polling
    const intervalId = setInterval(pollStatus, interval);

    return () => clearInterval(intervalId);
  }, [auditId, interval]);

  return { status, error };
}

// Made with Bob
