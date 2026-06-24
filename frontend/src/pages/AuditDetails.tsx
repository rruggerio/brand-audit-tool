import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Grid,
  Column,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tile,
  Tag,
  ProgressBar,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  SkeletonText,
  Accordion,
  AccordionItem,
  InlineNotification,
} from '@carbon/react';
import {
  ArrowLeft,
  Download,
  WarningAlt,
  Error,
  Camera,
  Close,
} from '@carbon/icons-react';
import { useAudit } from '../hooks/useApi';
import AnnotatedScreenshot from '../components/AnnotatedScreenshot';
import './AuditDetails.scss';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Issue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  location: string;
  recommendation: string;
  boundingBox: BoundingBox | null;
}

interface AuditResult {
  id: string;
  url: string;
  status: 'completed' | 'in_progress' | 'failed';
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
  issues: Issue[];
  metadata?: {
    duration?: number;
    aiCallsMade?: number;
    elementsAnalyzed?: number;
  };
}

const AuditDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: rawAudit, loading, error } = useAudit(id || '');
  const audit = rawAudit as AuditResult | null;

  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [showScreenshot, setShowScreenshot] = useState(true);

  const getSeverityTag = (severity: string) => {
    switch (severity) {
      case 'critical': return <Tag type="red" renderIcon={Error}>Critical</Tag>;
      case 'high':     return <Tag type="red" renderIcon={WarningAlt}>High</Tag>;
      case 'medium':   return <Tag type="warm-gray">Medium</Tag>;
      case 'low':      return <Tag type="blue">Low</Tag>;
      default:         return <Tag>Unknown</Tag>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const headers = [
    { key: 'marker',      header: '#' },
    { key: 'severity',    header: 'Severity' },
    { key: 'category',    header: 'Category' },
    { key: 'description', header: 'Description' },
  ];

  const annotatedCount = audit?.issues.filter(i => i.boundingBox).length ?? 0;

  const rows = audit?.issues.map((issue, idx) => ({
    id: issue.id,
    marker: issue.boundingBox
      ? <span className="issue-marker-badge">{idx + 1}</span>
      : <span style={{ color: '#6f6f6f' }}>—</span>,
    severity: getSeverityTag(issue.severity),
    category: issue.category,
    description: issue.description,
  })) ?? [];

  if (loading) {
    return (
      <div className="audit-details-page">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <SkeletonText paragraph lineCount={10} />
          </Column>
        </Grid>
      </div>
    );
  }

  if (error) {
    return (
      <div className="audit-details-page">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <InlineNotification
              kind="error"
              title="Error loading audit"
              subtitle={error.message || 'Failed to load audit details'}
              lowContrast
            />
            <Button onClick={() => navigate('/dashboard')} style={{ marginTop: '1rem' }}>
              Back to Dashboard
            </Button>
          </Column>
        </Grid>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="audit-details-page">
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <InlineNotification
              kind="warning"
              title="Audit not found"
              subtitle="The requested audit could not be found"
              lowContrast
            />
            <Button onClick={() => navigate('/dashboard')} style={{ marginTop: '1rem' }}>
              Back to Dashboard
            </Button>
          </Column>
        </Grid>
      </div>
    );
  }

  const scores = audit.scores ?? { visual: 0, component: 0, content: 0, accessibility: 0 };
  const durationSec = audit.metadata?.duration ? Math.round(audit.metadata.duration / 1000) : null;

  const issuesByCategory = (keywords: string[]) =>
    audit.issues.filter(i =>
      keywords.some(kw => i.category.toLowerCase().includes(kw))
    );

  return (
    <div className="audit-details-page">
      <Grid>
        {/* Header */}
        <Column lg={16} md={8} sm={4}>
          <div className="page-header">
            <div className="header-content">
              <Button kind="ghost" renderIcon={ArrowLeft} onClick={() => navigate('/dashboard')}>
                Back
              </Button>
              <div>
                <h1>Audit Results</h1>
                <p className="audit-url">{audit.url}</p>
                {durationSec && (
                  <p className="audit-meta">
                    Completed in {durationSec}s
                    {audit.metadata?.aiCallsMade ? ` · ${audit.metadata.aiCallsMade} AI calls` : ''}
                    {audit.metadata?.elementsAnalyzed ? ` · ${audit.metadata.elementsAnalyzed} elements analyzed` : ''}
                  </p>
                )}
              </div>
            </div>
            <Button renderIcon={Download} disabled>Download Report</Button>
          </div>
        </Column>

        {/* Score Overview */}
        <Column lg={16} md={8} sm={4}>
          <Tile className="score-tile">
            <div className="score-content">
              <div className="score-main">
                <div className={`score-value score-${getScoreColor(audit.score)}`}>
                  {audit.score}
                </div>
                <div className="score-label">Overall Score</div>
              </div>
              <div className="score-details">
                <div className="score-stat">
                  <span className="stat-value">{audit.summary.totalIssues}</span>
                  <span className="stat-label">Total Issues</span>
                </div>
                <div className="score-stat critical">
                  <span className="stat-value">{audit.summary.criticalIssues}</span>
                  <span className="stat-label">Critical</span>
                </div>
                <div className="score-stat high">
                  <span className="stat-value">{audit.summary.highIssues}</span>
                  <span className="stat-label">High</span>
                </div>
                <div className="score-stat medium">
                  <span className="stat-value">{audit.summary.mediumIssues}</span>
                  <span className="stat-label">Medium</span>
                </div>
                <div className="score-stat low">
                  <span className="stat-value">{audit.summary.lowIssues}</span>
                  <span className="stat-label">Low</span>
                </div>
              </div>
            </div>
          </Tile>
        </Column>

        {/* Annotated Screenshot */}
        {audit.screenshotUrl && audit.pageDimensions && (
          <Column lg={16} md={8} sm={4}>
            <div className="screenshot-section">
              <div className="screenshot-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Camera size={20} />
                  <h2 style={{ margin: 0 }}>Annotated Screenshot</h2>
                  {annotatedCount > 0 && (
                    <Tag type="blue" style={{ marginLeft: '0.5rem' }}>
                      {annotatedCount} of {audit.summary.totalIssues} issues mapped
                    </Tag>
                  )}
                </div>
                <Button
                  kind="ghost"
                  size="sm"
                  onClick={() => setShowScreenshot(v => !v)}
                >
                  {showScreenshot ? 'Hide' : 'Show'}
                </Button>
              </div>

              {showScreenshot && (
                <>
                  <p className="screenshot-hint">
                    Click a numbered marker to see issue details. Click again to dismiss.
                  </p>
                  <AnnotatedScreenshot
                    screenshotUrl={audit.screenshotUrl}
                    issues={audit.issues}
                    pageDimensions={audit.pageDimensions}
                    selectedId={selectedIssueId}
                    onSelect={setSelectedIssueId}
                  />
                  {selectedIssueId && (() => {
                    const issue = audit.issues.find(i => i.id === selectedIssueId);
                    const markerIndex = audit.issues.findIndex(i => i.id === selectedIssueId) + 1;
                    if (!issue) return null;
                    return (
                      <div className="issue-detail-card">
                        <div className="issue-detail-header">
                          <span className="issue-marker-badge">{markerIndex}</span>
                          {getSeverityTag(issue.severity)}
                          <strong className="issue-detail-title">{issue.title || issue.description}</strong>
                          <Button
                            kind="ghost"
                            size="sm"
                            renderIcon={Close}
                            iconDescription="Dismiss"
                            hasIconOnly
                            onClick={() => setSelectedIssueId(null)}
                          />
                        </div>
                        <p className="issue-detail-category">{issue.category}</p>
                        <p className="issue-detail-description">{issue.description}</p>
                        {issue.recommendation && (
                          <p className="issue-detail-recommendation">
                            <strong>Recommendation:</strong> {issue.recommendation}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </Column>
        )}

        {/* Analysis Tabs */}
        <Column lg={16} md={8} sm={4}>
          <Tabs>
            <TabList aria-label="Analysis tabs">
              <Tab>Visual Design</Tab>
              <Tab>Components</Tab>
              <Tab>Content</Tab>
              <Tab>Accessibility</Tab>
              <Tab>All Issues</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <div className="analysis-panel">
                  <h3>Visual Design Analysis</h3>
                  <p className="panel-description">GPT-4o evaluated colors, typography, spacing, and logo usage against IBM Brand Guidelines.</p>
                  <div className="metrics-grid">
                    <div className="metric-item">
                      <div className="metric-label">Visual Compliance Score</div>
                      <ProgressBar value={scores.visual} label={`${scores.visual}%`} />
                    </div>
                  </div>
                  <IssueList issues={issuesByCategory(['visual', 'color', 'typography', 'layout', 'spacing'])} />
                </div>
              </TabPanel>

              <TabPanel>
                <div className="analysis-panel">
                  <h3>Component Analysis</h3>
                  <p className="panel-description">Claude Haiku evaluated adherence to IBM Carbon Design System component patterns.</p>
                  <div className="metrics-grid">
                    <div className="metric-item">
                      <div className="metric-label">Component Compliance Score</div>
                      <ProgressBar value={scores.component} label={`${scores.component}%`} />
                    </div>
                  </div>
                  <IssueList issues={issuesByCategory(['component', 'design system'])} />
                </div>
              </TabPanel>

              <TabPanel>
                <div className="analysis-panel">
                  <h3>Content Analysis</h3>
                  <p className="panel-description">GPT-4o evaluated tone, voice, and messaging alignment with IBM brand guidelines.</p>
                  <div className="metrics-grid">
                    <div className="metric-item">
                      <div className="metric-label">Content Compliance Score</div>
                      <ProgressBar value={scores.content} label={`${scores.content}%`} />
                    </div>
                  </div>
                  <IssueList issues={issuesByCategory(['content', 'messaging', 'tone', 'voice', 'keyword'])} />
                </div>
              </TabPanel>

              <TabPanel>
                <div className="analysis-panel">
                  <h3>Accessibility Analysis</h3>
                  <p className="panel-description">Claude Haiku evaluated WCAG 2.1 AA compliance, keyboard navigation, and screen reader support.</p>
                  <div className="metrics-grid">
                    <div className="metric-item">
                      <div className="metric-label">Accessibility Score</div>
                      <ProgressBar value={scores.accessibility} label={`${scores.accessibility}%`} />
                    </div>
                  </div>
                  <IssueList issues={issuesByCategory(['accessibility', 'wcag', 'a11y'])} />
                </div>
              </TabPanel>

              {/* All Issues with clickable rows */}
              <TabPanel>
                <div className="issues-panel">
                  <DataTable rows={rows} headers={headers}>
                    {({ rows: tableRows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                      <TableContainer title="All Issues">
                        <Table {...getTableProps()}>
                          <TableHead>
                            <TableRow>
                              {headers.map(header => (
                                <TableHeader {...getHeaderProps({ header })} key={header.key}>
                                  {header.header}
                                </TableHeader>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {tableRows.map(row => (
                              <TableRow
                                {...getRowProps({ row })}
                                key={row.id}
                                onClick={() => setSelectedIssueId(prev => prev === row.id ? null : row.id)}
                                style={{
                                  cursor: 'pointer',
                                  background: selectedIssueId === row.id ? 'rgba(15, 98, 254, 0.08)' : undefined,
                                }}
                              >
                                {row.cells.map(cell => (
                                  <TableCell key={cell.id}>{cell.value}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </DataTable>
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Column>

        {/* Recommendations */}
        <Column lg={16} md={8} sm={4}>
          <div className="recommendations-section">
            <h2>Top Recommendations</h2>
            <Accordion>
              {audit.issues.slice(0, 5).map(issue => (
                <AccordionItem
                  key={issue.id}
                  title={
                    <div className="recommendation-title">
                      {getSeverityTag(issue.severity)}
                      <span>{issue.title || issue.description}</span>
                    </div>
                  }
                >
                  <div className="recommendation-content">
                    <p><strong>Category:</strong> {issue.category}</p>
                    <p><strong>Description:</strong> {issue.description}</p>
                    {issue.location && <p><strong>Location:</strong> {issue.location}</p>}
                    <p><strong>Recommendation:</strong> {issue.recommendation}</p>
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Column>
      </Grid>
    </div>
  );
};

// Small inline component to avoid repeating the issue list markup in each tab
const IssueList: React.FC<{ issues: Issue[] }> = ({ issues }) => {
  if (issues.length === 0) return <p style={{ marginTop: '1rem', color: '#6f6f6f' }}>No issues detected in this category.</p>;
  return (
    <ul className="category-issues-list">
      {issues.map(i => (
        <li key={i.id}>
          <strong>{i.title || i.description}</strong>
          {i.recommendation && <span> — {i.recommendation}</span>}
        </li>
      ))}
    </ul>
  );
};

export default AuditDetails;

// Made with Bob
