const express = require("express");
const bookingController = require("../controllers/bookingController");
const authController = require("../controllers/authController");

// 3) Routes // Mounting the router
const router = express.Router(); // Create a new router

router.use(authController.protect); // Protect all routes after this middleware
router.get("/checkout-session/:tourId", bookingController.getCheckoutSession);

router.use(authController.restrictTo("admin")); // Restrict all routes after this middleware

router.route("/").get(bookingController.getAllBookings); // Get all bookings
router.post("/", bookingController.createBooking); // Create a new booking
router
  .route("/:id")
  .get(bookingController.getBooking) // Get a specific booking by ID
  .patch(bookingController.updateBooking) // Update a specific booking by ID
  .delete(bookingController.deleteBooking); // Delete a specific booking by ID

module.exports = router; // Export the router
