import dotenv from "dotenv"; 
dotenv.config(); 

import express from "express";
import cors from "cors";
import apiRoutes from "./routers/api.js";

const app = express();
const PORT = process.env.PORT || 3443;

app.use(express.json());
app.use(cors());

// API végpontok
app.use("/api", apiRoutes);

// Szerver indítása
app.listen(PORT, () => {
    console.log(`HTTP szerver fut a ${PORT} porton`);
});
// a server indítása fontos: ha változtatások változtás akkor megint ájra kell indítani:  npm start
// de ha auotomatikusan újra initás ha van váétoztatás: npm run dev 
