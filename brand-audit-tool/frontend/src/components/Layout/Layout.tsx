import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
  Content,
} from '@carbon/react';
import { Notification, UserAvatar } from '@carbon/icons-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <>
      <Header aria-label="Brand Audit Tool">
        <SkipToContent />
        <HeaderName href="#" onClick={handleNavigation('/')} prefix="IBM">
          Brand Audit Tool
        </HeaderName>
        <HeaderNavigation aria-label="Main Navigation">
          <HeaderMenuItem
            href="#"
            onClick={handleNavigation('/')}
            isActive={location.pathname === '/'}
          >
            Dashboard
          </HeaderMenuItem>
          <HeaderMenuItem
            href="#"
            onClick={handleNavigation('/guidelines')}
            isActive={location.pathname === '/guidelines'}
          >
            Guidelines
          </HeaderMenuItem>
          <HeaderMenuItem
            href="#"
            onClick={handleNavigation('/audits/new')}
            isActive={location.pathname === '/audits/new'}
          >
            New Audit
          </HeaderMenuItem>
          <HeaderMenuItem
            href="#"
            onClick={handleNavigation('/reports')}
            isActive={location.pathname === '/reports'}
          >
            Reports
          </HeaderMenuItem>
          <HeaderMenuItem
            href="#"
            onClick={handleNavigation('/api-test')}
            isActive={location.pathname === '/api-test'}
          >
            API Test
          </HeaderMenuItem>
        </HeaderNavigation>
        <HeaderGlobalBar>
          <HeaderGlobalAction aria-label="Notifications">
            <Notification size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="User Profile">
            <UserAvatar size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>
      <Content>{children}</Content>
    </>
  );
};

export default Layout;

// Made with Bob