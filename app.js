const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const http = require("http");
const { initSocket } = require("./src/utils/socket");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// ✅ Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://dlksoftwaresolutions.co.in/admin",
      "https://dlksoftwaresolutions.co.in",
      "https://www.dlksoftwaresolutions.co.in",
      "https://admin.dlksoftwaresolutions.co.in",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Serve static files (for uploaded photos)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
// ✅ Admin Module Routes (Banners, Enquiries, Categories, etc.)
const adminRoutes = require("./src/modules/admin/adminRoutes");
app.use("/admin", adminRoutes);

const adminCourse = require("./src/modules/admin_courses/admin_CoursesRoutes");
app.use("/admin", adminCourse);

const adminContact = require("./src/modules/admin_contact/ContactRoutes");
app.use("/admin", adminContact);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("✅ DLK Admin API is running...");
});

// 🔍 Debug route to verify server update
app.get("/debug-routes", (req, res) => {
  res.json({
    status: "online",
    timestamp: new Date().toISOString(),
    message: "If you see this, the server is running the LATEST code updates."
  });
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start server
const PORT = process.env.NODE_ENV === "production" ? 6000 : 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});
