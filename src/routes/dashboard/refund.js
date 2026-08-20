import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const RefundPage = lazy(() => import('../../pages/refunds'));
const NotFound = lazy(() => import('../../container/pages/404'));

function EventRoute() {
    return (
        <Routes>
            <Route index element={<RefundPage />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default EventRoute;