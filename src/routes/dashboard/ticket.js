import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const TicketCreate = lazy(() => import('../../pages/events/tickets/create'));
const TicketEdit = lazy(() => import('../../pages/events/tickets/edit'));
const NotFound = lazy(() => import('../../container/pages/404'));

function EventRoute() {
    return (
        <Routes>
            <Route path="/create" element={<TicketCreate />} />
            <Route path="/edit/:id" element={<TicketEdit />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default EventRoute;