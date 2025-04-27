const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet"); // Middleware to set security HTTP headers
const mongoSanitize = require("express-mongo-sanitize"); // Middleware to sanitize data
const xss = require("xss-clean"); // Middleware to prevent XSS attacks
const hpp = require("hpp"); // Middleware to prevent parameter pollution
const cookieParser = require("cookie-parser");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");
const bookingRouter = require("./routes/bookingRoutes");

// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = [
  "https://unpkg.com/",
  "https://tile.openstreetmap.org",
  "https://js.stripe.com", // Allow Stripe script
];
const styleSrcUrls = [
  "https://unpkg.com/",
  "https://tile.openstreetmap.org",
  "https://fonts.googleapis.com/",
];
const connectSrcUrls = ["https://unpkg.com", "https://tile.openstreetmap.org"];
const fontSrcUrls = ["fonts.googleapis.com", "fonts.gstatic.com"];

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "./views"));

// 1) GLOBAL Middleware
app.use(express.static(path.join(__dirname, "public"))); // Middleware to serve static files

//  Set Security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // Middleware to log the request
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" })); // Middleware to parse the body of the request
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser()); // Middleware to parse cookies

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  }),
);

//set security http headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "ws://127.0.0.1:52421", ...connectSrcUrls],
        scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: ["'self'", "blob:", "data:", "https:"],
        fontSrc: ["'self'", ...fontSrcUrls],
        frameSrc: ["'self'", "https://js.stripe.com"], // Allow Stripe for framing
      },
    },
  }),
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// Route Handlers
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

app.all("*", (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
