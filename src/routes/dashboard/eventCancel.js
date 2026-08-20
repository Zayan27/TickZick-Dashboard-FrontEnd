import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const EventPage = lazy(() => import('../../pages/events/ticket-cancel'));
const EventShow = lazy(() => import('../../pages/events/ticket-cancel/show'));
const NotFound = lazy(() => import('../../container/pages/404'));

function EventRoute() {
    return (
        <Routes>
            <Route index element={<EventPage />} />
            <Route path="/show/:id" element={<EventShow />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default EventRoute;