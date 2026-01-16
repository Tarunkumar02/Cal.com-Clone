import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import EventTypes from './pages/admin/EventTypes';
import EventTypeForm from './pages/admin/EventTypeForm';
import Availability from './pages/admin/Availability';
import AvailabilityEdit from './pages/admin/AvailabilityEdit';
import Bookings from './pages/admin/Bookings';
import PublicProfile from './pages/public/PublicProfile';
import BookingPage from './pages/public/BookingPage';
import BookingConfirmation from './pages/public/BookingConfirmation';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/admin/event-types" replace />} />
        <Route path="/profile" element={<PublicProfile />} />
        <Route path="/book/:slug" element={<BookingPage />} />
        <Route path="/booking/confirmation" element={<BookingConfirmation />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="event-types" element={<EventTypes />} />
          <Route path="event-types/new" element={<EventTypeForm />} />
          <Route path="event-types/:id/edit" element={<EventTypeForm />} />
          <Route path="availability" element={<Availability />} />
          <Route path="availability/:id" element={<AvailabilityEdit />} />
          <Route path="bookings" element={<Bookings />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
