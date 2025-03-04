import dotenv from "dotenv"; 
dotenv.config();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser"; 
import apiRoutes from "./routers/api.js";

const app = express();
const PORT = process.env.PORT || 3443;

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.use("/api", apiRoutes);

app.listen(PORT, () => {
    console.log(`HTTP szerver fut a ${PORT} porton`);
});
