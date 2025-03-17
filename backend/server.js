import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3443;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(` HTTP szerver fut a ${PORT} porton`);
});
