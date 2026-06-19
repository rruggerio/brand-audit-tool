import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Column,
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tag,
  SkeletonText,
  InlineNotification,
} from '@carbon/react';
import { Add, View, WarningAlt, Error as ErrorIcon } from '@carbon/icons-react';
import { useAudits } from '../hooks/useApi';
import './Reports.scss';

const getSeverityTag = (score: number) => {
  if (score >= 90) return <Tag type="green">Passing</Tag>;
  if (score >= 70) return <Tag type="warm-gray">Needs Work</Tag>;
  return <Tag type="red" renderIcon={WarningAlt}>At Risk</Tag>;
};

const getStatusTag = (status: string) => {
  switch (status) {
    case 'completed': return <Tag type="green">Completed</Tag>;
    case 'in_progress': return <Tag type="blue">In Progress</Tag>;
    case 'failed': return <Tag type="red" renderIcon={ErrorIcon}>Failed</Tag>;
    default: return <Tag>{status}</Tag>;
  }
};

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useAudits();
  const [search, setSearch] = useState('');

  const audits = data?.audits ?? [];

  const filtered = audits.filter(a =>
    !search || a.url.toLowerCase().includes(search.toLowerCase())
  );

  const headers = [
    { key: 'url',       header: 'URL' },
    { key: 'status',    header: 'Status' },
    { key: 'score',     header: 'Score' },
    { key: 'createdAt', header: 'Date' },
    { key: 'actions',   header: '' },
  ];

  const rows = filtered.map(audit => ({
    id: audit.id,
    url: <span className="audit-url-cell">{audit.url}</span>,
    status: getStatusTag(audit.status),
    score: audit.status === 'completed'
      ? <span>{audit.score} {getSeverityTag(audit.score)}</span>
      : <span style={{ color: '#6f6f6f' }}>—</span>,
    createdAt: new Date(audit.createdAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    }),
    actions: (
      <Button
        kind="ghost"
        size="sm"
        renderIcon={View}
        onClick={() => navigate(`/audits/${audit.id}`)}
        disabled={audit.status !== 'completed'}
      >
        View
      </Button>
    ),
  }));

  return (
    <div className="reports-page">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <div className="page-header">
            <div>
              <h1>Audit History</h1>
              <p className="page-description">All brand compliance audits you have run</p>
            </div>
            <Button renderIcon={Add} onClick={() => navigate('/audits/new')}>
              New Audit
            </Button>
          </div>
        </Column>

        <Column lg={16} md={8} sm={4}>
          {loading && <SkeletonText paragraph lineCount={6} />}

          {error && (
            <InlineNotification
              kind="error"
              title="Failed to load audits"
              subtitle={error.message}
              lowContrast
            />
          )}

          {!loading && !error && (
            <DataTable rows={rows} headers={headers} isSortable>
              {({
                rows: tableRows,
                headers: tableHeaders,
                getTableProps,
                getHeaderProps,
                getRowProps,
                getToolbarProps,
                getTableContainerProps,
              }) => (
                <TableContainer
                  title={`${audits.length} audit${audits.length !== 1 ? 's' : ''}`}
                  {...getTableContainerProps()}
                >
                  <TableToolbar {...getToolbarProps()}>
                    <TableToolbarContent>
                      <TableToolbarSearch
                        persistent
                        placeholder="Filter by URL…"
                        onChange={(_e: unknown, value?: string) =>
                          setSearch(value ?? '')
                        }
                      />
                    </TableToolbarContent>
                  </TableToolbar>
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        {tableHeaders.map(header => (
                          <TableHeader {...getHeaderProps({ header })} key={header.key}>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tableRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#6f6f6f' }}>
                            {search ? 'No audits match that URL.' : 'No audits yet. Run your first audit to see results here.'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        tableRows.map(row => (
                          <TableRow {...getRowProps({ row })} key={row.id}>
                            {row.cells.map(cell => (
                              <TableCell key={cell.id}>{cell.value}</TableCell>
                            ))}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
          )}
        </Column>

        {!loading && !error && audits.length > 0 && (
          <Column lg={16} md={8} sm={4}>
            <div className="stats-section">
              <h2>Summary</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{audits.length}</div>
                  <div className="stat-label">Total Audits</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {audits.filter(a => a.status === 'completed').length}
                  </div>
                  <div className="stat-label">Completed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {audits.filter(a => a.status === 'completed' && a.score >= 90).length}
                  </div>
                  <div className="stat-label">Passing (&ge;90)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {audits.filter(a => a.status === 'completed').length > 0
                      ? Math.round(
                          audits
                            .filter(a => a.status === 'completed')
                            .reduce((sum, a) => sum + a.score, 0) /
                            audits.filter(a => a.status === 'completed').length
                        )
                      : '—'}
                  </div>
                  <div className="stat-label">Avg Score</div>
                </div>
              </div>
            </div>
          </Column>
        )}
      </Grid>
    </div>
  );
};

export default Reports;

// Made with Bob
