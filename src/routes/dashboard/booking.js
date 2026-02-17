import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const BookingPage = lazy(() => import('../../pages/bookings'));
const NotFound = lazy(() => import('../../container/pages/404'));

function EventRoute() {
    return (
        <Routes>
            <Route index element={<BookingPage />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default EventRoute;