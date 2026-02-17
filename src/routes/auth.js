import React, { lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import AuthLayout from '../container/profile/authentication/Index';

const Login = lazy(() => import('../container/profile/authentication/overview/SignIn'));
const SignUp = lazy(() => import('../container/profile/authentication/overview/Signup'));
const ForgotPass = lazy(() => import('../container/profile/authentication/overview/ForgotPassword'));

const FrontendRoutes = () => {
  return (
    <Routes>

      <Route path="admin/login" element={<Login role="admin" />} />
      <Route path="organizer/login" element={<Login role="organizer" />} />
      <Route path="admin/forgotPassword" element={<ForgotPass role="admin" />} />
      <Route path="organizer/forgotPassword" element={<ForgotPass role="organizer" />} />
      <Route path="organizer/register" element={<SignUp role="organizer" />} />

      {/* Default fallback */}
      <Route path="*" element={<Navigate to="organizer/login" replace />} />

    </Routes>
  );
};

export default AuthLayout(FrontendRoutes);