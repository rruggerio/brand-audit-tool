import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Column,
  Tile,
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Tag,
  SkeletonText,
  SkeletonPlaceholder,
  InlineNotification,
} from '@carbon/react';
import {
  Add,
  DocumentView,
  Checkmark,
  WarningAlt,
  Error,
} from '@carbon/icons-react';
import { useAudits } from '../hooks/useApi';
import './Dashboard.scss';

interface DashboardStats {
  totalAudits: number;
  averageScore: number;
  criticalIssues: number;
  lastAuditDate: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  // useAudits expects (page, limit) as separate parameters
  const { data: auditsData, loading, error } = useAudits(1, 10);

  // Calculate dashboard statistics from real audit data
  const stats = useMemo<DashboardStats | null>(() => {
    if (!auditsData?.audits || auditsData.audits.length === 0) {
      return {
        totalAudits: 0,
        averageScore: 0,
        criticalIssues: 0,
        lastAuditDate: new Date().toISOString(),
      };
    }

    const audits = auditsData.audits;
    const completedAudits = audits.filter((a) => a.status === 'completed');
    
    // Calculate average score from completed audits
    const totalScore = completedAudits.reduce((sum, audit) => {
      return sum + (audit.score || 0);
    }, 0);
    const averageScore = completedAudits.length > 0
      ? Math.round(totalScore / completedAudits.length)
      : 0;

    // Count critical issues (score < 70)
    const criticalIssues = completedAudits.filter((a) =>
      (a.score || 0) < 70
    ).length;

    // Get most recent audit date
    const sortedAudits = [...audits].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const lastAuditDate = sortedAudits[0]?.createdAt || new Date().toISOString();

    return {
      totalAudits: auditsData.pagination.total,
      averageScore,
      criticalIssues,
      lastAuditDate,
    };
  }, [auditsData]);

  // Get recent audits (first 5)
  const recentAudits = useMemo(() => {
    return auditsData?.audits?.slice(0, 5) || [];
  }, [auditsData]);

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'completed':
        return <Tag type="green" renderIcon={Checkmark}>Completed</Tag>;
      case 'in_progress':
        return <Tag type="blue">In Progress</Tag>;
      case 'failed':
        return <Tag type="red" renderIcon={Error}>Failed</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const headers = [
    { key: 'url', header: 'URL' },
    { key: 'status', header: 'Status' },
    { key: 'score', header: 'Score' },
    { key: 'issuesFound', header: 'Issues Found' },
    { key: 'createdAt', header: 'Date' },
    { key: 'actions', header: 'Actions' },
  ];

  const rows = recentAudits.map((audit) => ({
    id: audit.id,
    url: audit.url,
    status: getStatusTag(audit.status),
    score: audit.status === 'completed' ? (
      <span className={`score-badge score-${getScoreColor(audit.score)}`}>
        {audit.score}%
      </span>
    ) : (
      '-'
    ),
    issuesFound: audit.status === 'completed' ? 'N/A' : '-',
    createdAt: new Date(audit.createdAt).toLocaleDateString(),
    actions: (
      <Button
        kind="ghost"
        size="sm"
        renderIcon={DocumentView}
        onClick={() => navigate(`/audits/${audit.id}`)}
      >
        View
      </Button>
    ),
  }));

  return (
    <div className="dashboard-page">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <div className="page-header">
            <div>
              <h1>Brand Audit Dashboard</h1>
              <p className="page-description">
                Monitor your brand compliance across all audited pages
              </p>
            </div>
            <Button
              renderIcon={Add}
              onClick={() => navigate('/audits/new')}
            >
              New Audit
            </Button>
          </div>
        </Column>

        {/* Error notification */}
        {error && (
          <Column lg={16} md={8} sm={4}>
            <InlineNotification
              kind="error"
              title="Error loading dashboard data"
              subtitle={error.message}
              lowContrast
            />
          </Column>
        )}

        {/* Statistics Cards */}
        <Column lg={4} md={2} sm={4}>
          <Tile className="stat-tile">
            {loading ? (
              <SkeletonText />
            ) : (
              <>
                <div className="stat-value">{stats?.totalAudits}</div>
                <div className="stat-label">Total Audits</div>
              </>
            )}
          </Tile>
        </Column>

        <Column lg={4} md={2} sm={4}>
          <Tile className="stat-tile">
            {loading ? (
              <SkeletonText />
            ) : (
              <>
                <div className="stat-value stat-success">
                  {stats?.averageScore}%
                </div>
                <div className="stat-label">Average Score</div>
              </>
            )}
          </Tile>
        </Column>

        <Column lg={4} md={2} sm={4}>
          <Tile className="stat-tile">
            {loading ? (
              <SkeletonText />
            ) : (
              <>
                <div className="stat-value stat-warning">
                  {stats?.criticalIssues}
                </div>
                <div className="stat-label">Critical Issues</div>
                <div className="stat-icon">
                  <WarningAlt size={24} />
                </div>
              </>
            )}
          </Tile>
        </Column>

        <Column lg={4} md={2} sm={4}>
          <Tile className="stat-tile">
            {loading ? (
              <SkeletonText />
            ) : (
              <>
                <div className="stat-value stat-small">
                  {new Date(stats?.lastAuditDate || '').toLocaleDateString()}
                </div>
                <div className="stat-label">Last Audit</div>
              </>
            )}
          </Tile>
        </Column>

        {/* Recent Audits Table */}
        <Column lg={16} md={8} sm={4}>
          <div className="recent-audits-section">
            <h2>Recent Audits</h2>
            {loading ? (
              <SkeletonPlaceholder style={{ height: '300px', width: '100%' }} />
            ) : (
              <DataTable rows={rows} headers={headers}>
                {({
                  rows,
                  headers,
                  getTableProps,
                  getHeaderProps,
                  getRowProps,
                }) => (
                  <TableContainer>
                    <Table {...getTableProps()}>
                      <TableHead>
                        <TableRow>
                          {headers.map((header) => (
                            <TableHeader {...getHeaderProps({ header })} key={header.key}>
                              {header.header}
                            </TableHeader>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow {...getRowProps({ row })} key={row.id}>
                            {row.cells.map((cell) => (
                              <TableCell key={cell.id}>{cell.value}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </DataTable>
            )}
          </div>
        </Column>

        {/* Quick Actions */}
        <Column lg={16} md={8} sm={4}>
          <Tile className="quick-actions-tile">
            <h3>Quick Actions</h3>
            <div className="quick-actions-grid">
              <Button
                kind="tertiary"
                onClick={() => navigate('/audits/new')}
                renderIcon={Add}
              >
                Start New Audit
              </Button>
              <Button
                kind="tertiary"
                onClick={() => navigate('/guidelines')}
                renderIcon={DocumentView}
              >
                Manage Guidelines
              </Button>
              <Button
                kind="tertiary"
                onClick={() => navigate('/reports')}
                renderIcon={DocumentView}
              >
                View All Reports
              </Button>
            </div>
          </Tile>
        </Column>
      </Grid>
    </div>
  );
};

export default Dashboard;

// Made with Bob
