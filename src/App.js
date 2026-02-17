import React, { lazy, useMemo } from 'react';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { ConfigProvider } from 'antd';

import store from './redux/store';
import './static/css/style.css';
import config from './config/config';
import ProtectedRoute from './components/utilities/protectedRoute';
import Auth from './routes/auth';
import Dashboard from './routes/dashboard';

import 'antd/dist/antd.less';

const NotFound = lazy(() => import('./container/pages/404'));
const { theme: baseTheme } = config;

function Root() {
  const { rtl, topMenu, mainContent } = useSelector((state) => ({
    rtl: state.ChangeLayoutMode.rtlData,
    topMenu: state.ChangeLayoutMode.topMenu,
    mainContent: state.ChangeLayoutMode.mode,
  }));

  const theme = useMemo(
    () => ({
      ...baseTheme,
      rtl,
      topMenu,
      mainContent,
    }),
    [rtl, topMenu, mainContent]
  );

  return (
    <ConfigProvider direction={rtl ? 'rtl' : 'ltr'}>
      <ThemeProvider theme={theme}>
        <Router basename={process.env.PUBLIC_URL}>
          <Routes>

            {/* AUTH PAGES */}
            <Route path="/auth/*" element={<Auth />} />

            {/* ORGANIZER DASHBOARD */}
            <Route
              path="/organizer/*"
              element={
                <ProtectedRoute allowedRole="organizer">
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* ADMIN DASHBOARD */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRole="admin">
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* DEFAULT */}
            <Route path="/" element={<Navigate to="/auth/organizer/login" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </Router>
      </ThemeProvider>
    </ConfigProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Root />
    </Provider>
  );
}

export default App;