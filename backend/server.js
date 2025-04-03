import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import apiRoutes from "./routers/api.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3306;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(` HTTP szerver fut a ${PORT} porton`);
});
