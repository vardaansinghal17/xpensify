import express from "express";
import env from "dotenv";
import cors from "cors";
import pg from "pg";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { fileURLToPath } from "url";
env.config();
const app = express();

app.use(express.json());


// const db = new pg.Client({
//   user: process.env.PG_USER,
//   host: process.env.PG_HOST,
//   database: process.env.PG_DATABASE,
//   password: process.env.PG_PASSWORD,
//   port: process.env.PG_PORT,
// });

// db.connect()
//   .then(() => console.log("Connected to PostgreSQL"))
//   .catch((err) => console.error("DB connection error:", err));


// middleware to handle CORS
app.use(cors({
  origin: process.env.CLIENT_URL , // your React app
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard",dashboardRoutes);

const port = process.env.PORT ||5000;

// Needed to use __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname,"uploads")));

app.listen(port,()=>{console.log(`server is running on port ${port}` )});


