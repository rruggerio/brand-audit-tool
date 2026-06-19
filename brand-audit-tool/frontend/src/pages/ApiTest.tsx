import React, { useState } from 'react';
import {
  Grid,
  Column,
  Button,
  Tile,
  CodeSnippet,
  InlineNotification,
  Accordion,
  AccordionItem,
  Loading,
} from '@carbon/react';
import { Checkmark, Error } from '@carbon/icons-react';
import { api } from '../services/api';
import './ApiTest.scss';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  response?: any;
  error?: string;
  duration?: number;
}

const ApiTest: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const updateResult = (name: string, update: Partial<TestResult>) => {
    setResults((prev) =>
      prev.map((r) => (r.name === name ? { ...r, ...update } : r))
    );
  };

  const runTest = async (
    name: string,
    testFn: () => Promise<any>
  ): Promise<void> => {
    const startTime = Date.now();
    
    try {
      const response = await testFn();
      const duration = Date.now() - startTime;
      
      updateResult(name, {
        status: 'success',
        response,
        duration,
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      updateResult(name, {
        status: 'error',
        error: error.message || 'Unknown error',
        duration,
      });
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    
    // Initialize test results
    const tests: TestResult[] = [
      { name: 'Health Check', status: 'pending' },
      { name: 'Get All Guidelines', status: 'pending' },
      { name: 'Get All Audits', status: 'pending' },
      { name: 'Get All Reports', status: 'pending' },
      { name: 'Create Guideline', status: 'pending' },
      { name: 'Get Single Guideline', status: 'pending' },
      { name: 'Update Guideline', status: 'pending' },
      { name: 'Delete Guideline', status: 'pending' },
    ];
    
    setResults(tests);

    // Test 1: Health Check
    await runTest('Health Check', () => api.health.check());

    // Test 2: Get All Guidelines
    await runTest('Get All Guidelines', () => api.guidelines.getAll());

    // Test 3: Get All Audits
    await runTest('Get All Audits', () => api.audits.getAll({ page: 1, limit: 5 }));

    // Test 4: Get All Reports
    await runTest('Get All Reports', () => api.reports.getAll());

    // Test 5: Create Guideline
    let createdGuidelineId: string | null = null;
    await runTest('Create Guideline', async () => {
      const result = await api.guidelines.create({
        name: 'Test Guideline',
        description: 'This is a test guideline created by API test',
        version: '1.0.0',
      });
      createdGuidelineId = result.id;
      return result;
    });

    // Test 6: Get Single Guideline (if created successfully)
    if (createdGuidelineId) {
      await runTest('Get Single Guideline', () =>
        api.guidelines.getById(createdGuidelineId!)
      );

      // Test 7: Update Guideline
      await runTest('Update Guideline', () =>
        api.guidelines.update(createdGuidelineId!, {
          name: 'Updated Test Guideline',
        })
      );

      // Test 8: Delete Guideline
      await runTest('Delete Guideline', () =>
        api.guidelines.delete(createdGuidelineId!)
      );
    } else {
      updateResult('Get Single Guideline', {
        status: 'error',
        error: 'Skipped - Create Guideline failed',
      });
      updateResult('Update Guideline', {
        status: 'error',
        error: 'Skipped - Create Guideline failed',
      });
      updateResult('Delete Guideline', {
        status: 'error',
        error: 'Skipped - Create Guideline failed',
      });
    }

    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Checkmark size={20} className="status-icon success" />;
      case 'error':
        return <Error size={20} className="status-icon error" />;
      case 'pending':
        return <Loading small withOverlay={false} />;
      default:
        return null;
    }
  };

  const successCount = results.filter((r) => r.status === 'success').length;
  const errorCount = results.filter((r) => r.status === 'error').length;
  const totalTests = results.length;

  return (
    <div className="api-test-page">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <div className="page-header">
            <div>
              <h1>API Integration Test</h1>
              <p className="page-description">
                Test all API endpoints to verify backend connectivity
              </p>
            </div>
            <Button onClick={runAllTests} disabled={testing}>
              {testing ? 'Testing...' : 'Run All Tests'}
            </Button>
          </div>
        </Column>

        {/* Test Summary */}
        {results.length > 0 && (
          <Column lg={16} md={8} sm={4}>
            <Tile className="summary-tile">
              <h3>Test Summary</h3>
              <div className="summary-stats">
                <div className="stat success">
                  <div className="stat-value">{successCount}</div>
                  <div className="stat-label">Passed</div>
                </div>
                <div className="stat error">
                  <div className="stat-value">{errorCount}</div>
                  <div className="stat-label">Failed</div>
                </div>
                <div className="stat total">
                  <div className="stat-value">{totalTests}</div>
                  <div className="stat-label">Total</div>
                </div>
              </div>
              {!testing && (
                <div className="summary-message">
                  {errorCount === 0 ? (
                    <InlineNotification
                      kind="success"
                      title="All tests passed!"
                      subtitle="Your API integration is working correctly."
                      hideCloseButton
                    />
                  ) : (
                    <InlineNotification
                      kind="error"
                      title={`${errorCount} test(s) failed`}
                      subtitle="Check the details below for more information."
                      hideCloseButton
                    />
                  )}
                </div>
              )}
            </Tile>
          </Column>
        )}

        {/* Test Results */}
        {results.length > 0 && (
          <Column lg={16} md={8} sm={4}>
            <Tile className="results-tile">
              <h3>Test Results</h3>
              <Accordion>
                {results.map((result, index) => (
                  <AccordionItem
                    title={
                      <div className="test-title">
                        {getStatusIcon(result.status)}
                        <span className="test-name">{result.name}</span>
                        {result.duration && (
                          <span className="test-duration">
                            {result.duration}ms
                          </span>
                        )}
                      </div>
                    }
                    key={index}
                  >
                    <div className="test-details">
                      {result.status === 'success' && result.response && (
                        <div>
                          <h4>Response:</h4>
                          <CodeSnippet type="multi" feedback="Copied!">
                            {JSON.stringify(result.response, null, 2)}
                          </CodeSnippet>
                        </div>
                      )}
                      {result.status === 'error' && (
                        <div>
                          <h4>Error:</h4>
                          <InlineNotification
                            kind="error"
                            title="Test Failed"
                            subtitle={result.error}
                            hideCloseButton
                          />
                        </div>
                      )}
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            </Tile>
          </Column>
        )}

        {/* Instructions */}
        {results.length === 0 && (
          <Column lg={16} md={8} sm={4}>
            <Tile className="instructions-tile">
              <h3>How to Test</h3>
              <ol>
                <li>
                  <strong>Ensure both servers are running:</strong>
                  <ul>
                    <li>Backend: http://localhost:3001</li>
                    <li>Frontend: http://localhost:3000</li>
                  </ul>
                </li>
                <li>
                  <strong>Click "Run All Tests"</strong> to test all API
                  endpoints
                </li>
                <li>
                  <strong>Review the results</strong> to see which endpoints are
                  working
                </li>
                <li>
                  <strong>Expand each test</strong> to see the response data or
                  error details
                </li>
              </ol>

              <h4>What Gets Tested:</h4>
              <ul>
                <li>✓ Health check endpoint</li>
                <li>✓ Get all guidelines</li>
                <li>✓ Get all audits</li>
                <li>✓ Get all reports</li>
                <li>✓ Create guideline (CRUD test)</li>
                <li>✓ Get single guideline</li>
                <li>✓ Update guideline</li>
                <li>✓ Delete guideline</li>
              </ul>

              <InlineNotification
                kind="info"
                title="Note"
                subtitle="The CRUD tests will create, read, update, and delete a test guideline. This is safe and won't affect your data."
                hideCloseButton
              />
            </Tile>
          </Column>
        )}
      </Grid>
    </div>
  );
};

export default ApiTest;

// Made with Bob
