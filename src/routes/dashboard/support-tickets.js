import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const SupportTicketPage = lazy(() => import('../../pages/support-tickets'));
const SupportTicketCreate = lazy(() => import('../../pages/support-tickets/create'));
const SupportTicketDetails = lazy(() => import('../../pages/support-tickets/message'));
const NotFound = lazy(() => import('../../container/pages/404'));

function EventRoute() {
    return (
        <Routes>
            <Route index element={<SupportTicketPage />} />
            <Route path="/create" element={<SupportTicketCreate />} />
            <Route path="/message/:id" element={<SupportTicketDetails />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default EventRoute;