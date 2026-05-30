import express from "express"; // Express framework for APIs
import cors from "cors"; // Enables frontend-backend communication
import cookieParser from "cookie-parser";
import "dotenv/config"; // Allows usage of environment variables
import connectDB from "./config/mongodb.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import subcatTileRoute from "./routes/subcatTileRoute.js";
import headerSlideRoute from "./routes/headerSlideRoute.js"
import orderNotifyRoute from "./routes/orderNotifyRoute.js";
import contactRoutes from './routes/contactRoutes.js';
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import scentFamilyRoute from "./routes/scentFamilyRoute.js";
import brandStatementRoute from "./routes/brandStatementRoute.js";
import giftSetDisplayRoute from "./routes/giftSetDisplayRoute.js";
import scentWardrobeRoute from "./routes/scentWardrobeRoute.js";
import pageImagesRoute from "./routes/pageImagesRoute.js";
// ------- APP Config ----------
const app = express();
const port = process.env.PORT || 4000;
connectDB(); // Connect to MongoDB
//main();

// --------middlewares------
app.use(express.json()); // any request it will pass by using json
app.use(cookieParser());
const normalizeOrigin = (value = "") => String(value).replace(/\/+$/, "");
const envAllowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => normalizeOrigin(origin.trim()))
  .filter(Boolean);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176',
  'http://127.0.0.1:5177',
  'http://[::1]:5173',
  'http://[::1]:5174',
  'https://levon-fja4.onrender.com',
  'https://levon-delta.vercel.app',
  'https://levon-lb.online',
  'https://www.levon-lb.online',
  ...envAllowedOrigins,
].map(normalizeOrigin);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(normalizeOrigin(origin))) return cb(null, true);
    return cb(null, false);
  },
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Authorization, X-Requested-With, token',
  credentials: true
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions)); // ensure preflight handled

// then body parsers, routes, etc.
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ------- API Endpoints ---------
app.use('/api/user', userRouter);
app.use('/api/product',productRouter);
app.use('/api/cart',cartRouter);
app.use('/api/order',orderRouter);
app.use("/api/subcat-tiles", subcatTileRoute);
app.use("/api/header-slides", headerSlideRoute);
app.use("/api/order", orderNotifyRoute);
app.use('/api/contact', contactRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/scent-families", scentFamilyRoute);
app.use("/api/brand-statement", brandStatementRoute);
app.use("/api/gift-set-display", giftSetDisplayRoute);
app.use("/api/scent-wardrobe", scentWardrobeRoute);
app.use("/api/page-images", pageImagesRoute);

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: "Backend is working!" });
});


app.get('/',(req,res)=>{
  res.send("API Working") // when ever i type npm run server it will print API WORKING
 })
 

// Start the Express server
app.listen(port, () => {
  if (process.env.NODE_ENV !== "production") {
    console.log('Server start On PORT : ' + port );
  }
})// to start the express server

