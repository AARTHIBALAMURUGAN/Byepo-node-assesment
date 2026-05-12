const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const userRoutes = require("./Routes/userRoutes");
const superAdminRoutes = require("./Routes/superAdminRoutes");
const adminRoutes = require("./Routes/adminRoutes");

const app = express();
connectDB();

const allowedOrigins = [
  "https://byepo-node-assesment-g8dl.vercel.app",
  "https://byepo-node-assesment-k2hp.vercel.app",
  "https://byepo-node-assesment.vercel.app",

 "http://localhost:5175",
 "http://localhost:5174",
"http://localhost:5176"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("API Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
