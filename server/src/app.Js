require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const app = express();

// =======================
// Security (تم التعديل هنا لفك قفل الأزرار وجعلها تعمل)
// =======================
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"], // هذا السطر يسمح بتشغيل الأزرار
                styleSrc: ["'self'", "'unsafe-inline'"],
            },
        },
    })
);

   helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"], // هذا التعديل يسمح للأزرار بالاستجابة للضغط واللمس
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "blob:"]
            },
        },
    })
);

app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(compression());

// =======================
// Rate Limit
// =======================
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "عدد الطلبات كبير، حاول لاحقاً."
    }
});
app.use(limiter);

// =======================
// Body Parser
// =======================
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// =======================
// Static Files
// =======================
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// =======================
// API Routes
// =======================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/rooms", require("./routes/rooms"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/reactions", require("./routes/reactions"));
app.use("/api/friends", require("./routes/friends"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/users", require("./routes/users"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/store", require("./routes/store"));
app.use("/api/dashboard", require("./routes/dashboard"));

// =======================
// Home & Pages Routing
// =======================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/guest.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public/guest.html"));
});

app.get("/login.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public/login.html"));
});

app.get("/register.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public/register.html"));
});

app.get("/rooms.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public/rooms.html"));
});

app.get("/chat.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public/chat.html"));
});

// =======================
// Health Check
// =======================
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        name: process.env.SITE_NAME,
        status: "running",
        time: new Date()
    });
});

// =======================
// 404
// =======================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "الصفحة غير موجودة"
    });
});

// =======================
// Error Handler
// =======================
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        success: false,
        message: "خطأ داخلي في الخادم"
    });
});

module.exports = app;
