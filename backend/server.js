import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRoutes from './routers/api.js';
dotenv.config();

const app = express();
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
app.use(express.json());
app.use(cors());

// API végpontok
app.use('/api', apiRoutes);

// HTTPS szerver indítása
https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
    console.log(`HTTPS server is running on https://localhost:${HTTPS_PORT}`);
});
