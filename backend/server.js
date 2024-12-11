import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import pagesRoutes from './routers/pages.js';
import apiRoutes from './routers/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();
app.use(express.json());
app.use(cors());

// Statikus fájlok kiszolgálása 
app.use(express.static('frontend/src'));

// Dinamikus oldalak
app.use('/', pagesRoutes);

// API végpontok
app.use('/api', apiRoutes);

// 404-es oldal kezelése
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'frontend', '404.html'));
});

// Szerver indítása
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
