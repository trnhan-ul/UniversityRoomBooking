const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// GET /api/bookings/pending  -> only Manager/Admin
router.get('/pending', authenticate, authorizeRoles(['STAFF', 'ADMIN']), bookingController.getPendingBookings);
// GET /api/bookings/statistics -> get booking statistics
router.get('/statistics', authenticate, authorizeRoles(['STAFF', 'ADMIN']), bookingController.getBookingStatistics);


// GET /api/bookings/:id -> view booking detail (Manager/Admin)
router.get('/:id', authenticate, authorizeRoles(['STAFF', 'ADMIN']), bookingController.getBookingById);

// PATCH /api/bookings/:id/approve -> only Manager/Admin
router.patch('/:id/approve', authenticate, authorizeRoles(['STAFF', 'ADMIN']), bookingController.approveBooking);

// PATCH /api/bookings/:id/cancel -> user cancel own booking
router.patch('/:id/cancel', authenticate, bookingController.cancelBooking);

module.exports = router;
