const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Routes
app.use("/api", userRoutes);
app.use("/api", foodRoutes);
app.use("/api", tableRoutes);
app.use("/api", orderRoutes);
app.use("/api", paymentRoutes);
app.use("/api/report", reportRoutes); 