import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const ProfileEdit = lazy(() => import('../../pages/profile/index'));
const ProfileChangePassword = lazy(() => import('../../pages/profile/change-password'));
const NotFound = lazy(() => import('../../container/pages/404'));

function ProfileRoute() {
  return (
    <Routes>
      <Route path="edit/*" element={<ProfileEdit />} />
      <Route path="change-password/*" element={<ProfileChangePassword />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default ProfileRoute;