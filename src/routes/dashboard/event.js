import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const EventPage = lazy(() => import('../../pages/events'));
const EventEdit = lazy(() => import('../../pages/events/edit'));
const EventShow = lazy(() => import('../../pages/events/show'));
const NotFound = lazy(() => import('../../container/pages/404'));

function EventRoute() {
    return (
        <Routes>
            <Route index element={<EventPage />} />
            <Route path="/edit/:id" element={<EventEdit />} />
            <Route path="/show/:id" element={<EventShow />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default EventRoute;