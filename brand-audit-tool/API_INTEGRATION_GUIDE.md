# API Integration Guide

This guide explains how to integrate the frontend with the backend API.

## 📁 Files Created

### 1. API Service Layer (`frontend/src/services/api.ts`)
Centralized API client with methods for all backend endpoints.

### 2. Custom React Hooks (`frontend/src/hooks/useApi.ts`)
Reusable hooks for API calls with loading and error states.

### 3. Environment Configuration (`frontend/.env`)
Environment variables for API URL configuration.

### 4. TypeScript Definitions (`frontend/src/vite-env.d.ts`)
Type definitions for Vite environment variables.

---

## 🚀 Quick Start

### Step 1: Import the API or Hooks

```typescript
// Option 1: Use the API service directly
import { api } from '../services/api';

// Option 2: Use custom hooks (recommended)
import { useAudits, useCreateAudit } from '../hooks/useApi';
```

### Step 2: Replace Mock Data with Real API Calls

#### Example: Dashboard Page

**Before (Mock Data):**
```typescript
useEffect(() => {
  setTimeout(() => {
    setStats({ totalAudits: 24, averageScore: 87.5, ... });
    setRecentAudits([...]);
    setLoading(false);
  }, 1000);
}, []);
```

**After (Real API):**
```typescript
import { useAudits } from '../hooks/useApi';

const Dashboard: React.FC = () => {
  const { data, loading, error } = useAudits(1, 10);
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  return (
    // Use data.audits instead of mock data
  );
};
```

---

## 📚 API Methods Reference

### Health Check
```typescript
const health = await api.health.check();
// Returns: { status: 'ok', timestamp: '...' }
```

### Guidelines API

```typescript
// Get all guidelines
const { guidelines } = await api.guidelines.getAll();

// Get single guideline
const guideline = await api.guidelines.getById('guideline-id');

// Create guideline
const result = await api.guidelines.create({
  name: 'Brand Guidelines 2024',
  description: 'Official brand guidelines',
  version: '1.0.0'
});

// Update guideline
await api.guidelines.update('guideline-id', {
  name: 'Updated Name'
});

// Delete guideline
await api.guidelines.delete('guideline-id');

// Upload PDF
const result = await api.guidelines.uploadPdf(file);
```

### Audits API

```typescript
// Get all audits with pagination
const { audits, pagination } = await api.audits.getAll({ page: 1, limit: 10 });

// Get single audit
const audit = await api.audits.getById('audit-id');

// Create new audit
const result = await api.audits.create({
  url: 'https://example.com',
  depth: 'single',
  guidelines: ['guideline-1', 'guideline-2'],
  analysisTypes: ['visual', 'component', 'content', 'accessibility'],
  crawlOptions: {
    followExternalLinks: false,
    respectRobotsTxt: true,
    maxPages: 10
  },
  aiProvider: 'both'
});

// Get audit status (for polling)
const status = await api.audits.getStatus('audit-id');

// Cancel audit
await api.audits.cancel('audit-id');
```

### Reports API

```typescript
// Get all reports
const { reports } = await api.reports.getAll();

// Get reports by audit ID
const { reports } = await api.reports.getByAuditId('audit-id');

// Generate PDF report
const result = await api.reports.generatePdf('audit-id');

// Generate CSV report
const result = await api.reports.generateCsv('audit-id');

// Download report (triggers browser download)
api.reports.download('report-id');

// Delete report
await api.reports.delete('report-id');
```

---

## 🎣 Custom Hooks Reference

### Data Fetching Hooks

```typescript
// Fetch audits with pagination
const { data, loading, error, refetch } = useAudits(page, limit);

// Fetch single audit
const { data, loading, error, refetch } = useAudit(auditId);

// Fetch guidelines
const { data, loading, error, refetch } = useGuidelines();

// Fetch single guideline
const { data, loading, error, refetch } = useGuideline(guidelineId);

// Fetch reports
const { data, loading, error, refetch } = useReports();

// Fetch reports by audit
const { data, loading, error, refetch } = useReportsByAudit(auditId);
```

### Mutation Hooks

```typescript
// Create audit
const { mutate, loading, error, data } = useCreateAudit();
await mutate(auditData);

// Create guideline
const { mutate, loading, error, data } = useCreateGuideline();
await mutate(guidelineData);

// Update guideline
const { mutate, loading, error, data } = useUpdateGuideline();
await mutate({ id: 'guideline-id', data: updateData });

// Delete guideline
const { mutate, loading, error, data } = useDeleteGuideline();
await mutate('guideline-id');

// Generate PDF report
const { mutate, loading, error, data } = useGeneratePdfReport();
await mutate('audit-id');

// Generate CSV report
const { mutate, loading, error, data } = useGenerateCsvReport();
await mutate('audit-id');
```

### Special Hooks

```typescript
// Poll audit status (auto-updates every 2 seconds)
const { status, error } = useAuditStatus(auditId, 2000);
// Returns: { id, status, progress, message }
```

---

## 💡 Integration Examples

### Example 1: Dashboard with Real Data

```typescript
import React from 'react';
import { useAudits } from '../hooks/useApi';

const Dashboard: React.FC = () => {
  const { data, loading, error, refetch } = useAudits(1, 10);

  if (loading) return <SkeletonText />;
  if (error) return <InlineNotification kind="error" title="Error" subtitle={error.message} />;

  const stats = {
    totalAudits: data?.pagination.total || 0,
    averageScore: calculateAverage(data?.audits),
    criticalIssues: countCriticalIssues(data?.audits),
  };

  return (
    <div>
      <StatCard value={stats.totalAudits} label="Total Audits" />
      <AuditsTable audits={data?.audits || []} />
      <Button onClick={refetch}>Refresh</Button>
    </div>
  );
};
```

### Example 2: Create New Audit

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateAudit } from '../hooks/useApi';

const NewAudit: React.FC = () => {
  const navigate = useNavigate();
  const { mutate, loading, error } = useCreateAudit();
  const [config, setConfig] = useState({ /* ... */ });

  const handleSubmit = async () => {
    try {
      const result = await mutate(config);
      navigate(`/audits/${result.id}`);
    } catch (err) {
      console.error('Failed to create audit:', err);
    }
  };

  return (
    <Form>
      {/* Form fields */}
      {error && <InlineNotification kind="error" subtitle={error.message} />}
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Creating...' : 'Create Audit'}
      </Button>
    </Form>
  );
};
```

### Example 3: Guidelines Management

```typescript
import React from 'react';
import { useGuidelines, useDeleteGuideline } from '../hooks/useApi';

const Guidelines: React.FC = () => {
  const { data, loading, error, refetch } = useGuidelines();
  const deleteMutation = useDeleteGuideline();

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutate(id);
      refetch(); // Refresh the list
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  if (loading) return <SkeletonText />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <DataTable
      rows={data?.guidelines || []}
      onDelete={handleDelete}
    />
  );
};
```

### Example 4: Audit Status Polling

```typescript
import React from 'react';
import { useAuditStatus } from '../hooks/useApi';

const AuditProgress: React.FC<{ auditId: string }> = ({ auditId }) => {
  const { status, error } = useAuditStatus(auditId, 2000);

  if (error) return <div>Error: {error.message}</div>;
  if (!status) return <Loading />;

  return (
    <div>
      <ProgressBar value={status.progress} label={`${status.progress}%`} />
      <p>Status: {status.status}</p>
      <p>{status.message}</p>
    </div>
  );
};
```

---

## 🔧 Error Handling

All API calls return errors in a consistent format:

```typescript
interface ApiError {
  message: string;
  status: number;
  details?: any;
}
```

### Handling Errors in Components

```typescript
const { data, loading, error } = useAudits();

if (error) {
  return (
    <InlineNotification
      kind="error"
      title={`Error ${error.status}`}
      subtitle={error.message}
    />
  );
}
```

### Handling Errors in Mutations

```typescript
const { mutate, error } = useCreateAudit();

const handleSubmit = async () => {
  try {
    await mutate(data);
    // Success
  } catch (err) {
    const apiError = err as ApiError;
    setNotification({
      kind: 'error',
      title: 'Failed to create audit',
      subtitle: apiError.message
    });
  }
};
```

---

## 🌐 Environment Configuration

### Development
```env
# frontend/.env
VITE_API_URL=http://localhost:3001/api
```

### Production
```env
# frontend/.env.production
VITE_API_URL=https://api.yourdomain.com/api
```

---

## ✅ Integration Checklist

- [x] API service layer created (`services/api.ts`)
- [x] Custom hooks created (`hooks/useApi.ts`)
- [x] Environment variables configured (`.env`)
- [x] TypeScript types defined (`vite-env.d.ts`)
- [ ] Replace mock data in Dashboard
- [ ] Replace mock data in Guidelines
- [ ] Replace mock data in NewAudit
- [ ] Replace mock data in AuditDetails
- [ ] Replace mock data in Reports
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Add retry logic
- [ ] Add request caching
- [ ] Add optimistic updates

---

## 🚀 Next Steps

1. **Update Dashboard.tsx**: Replace `setTimeout` mock with `useAudits()` hook
2. **Update Guidelines.tsx**: Replace mock data with `useGuidelines()` hook
3. **Update NewAudit.tsx**: Use `useCreateAudit()` for form submission
4. **Update AuditDetails.tsx**: Use `useAudit(id)` to fetch audit data
5. **Update Reports.tsx**: Use `useReports()` to fetch reports list
6. **Add Error Boundaries**: Wrap components with error boundaries
7. **Test API Integration**: Verify all endpoints work correctly
8. **Add Loading States**: Ensure smooth UX during API calls

---

## 📖 Additional Resources

- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [React Hooks Documentation](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## 🆘 Troubleshooting

### CORS Errors
If you see CORS errors, ensure the backend has CORS enabled:
```typescript
// backend/src/server.ts
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Network Errors
Check that both servers are running:
- Backend: http://localhost:3001
- Frontend: http://localhost:3000

### Type Errors
Ensure `vite-env.d.ts` is included in `tsconfig.json`:
```json
{
  "include": ["src/**/*", "src/vite-env.d.ts"]
}