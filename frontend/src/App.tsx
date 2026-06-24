import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Theme } from '@carbon/react';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Guidelines from './pages/Guidelines';
import NewAudit from './pages/NewAudit';
import AuditDetails from './pages/AuditDetails';
import Reports from './pages/Reports';
import ApiTest from './pages/ApiTest';

const App: React.FC = () => {
  return (
    <Theme theme="g100">
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/guidelines" element={<Guidelines />} />
          <Route path="/audits/new" element={<NewAudit />} />
          <Route path="/audits/:id" element={<AuditDetails />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/api-test" element={<ApiTest />} />
        </Routes>
      </Layout>
    </Theme>
  );
};

export default App;

// Made with Bob
