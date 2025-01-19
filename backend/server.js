import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRoutes from './routers/api.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3443;

app.use(express.json());
app.use(cors());

// API végpontok
app.use('/api', apiRoutes);

// HTTP szerver indítása
app.listen(PORT, () => {
    console.log(`HTTP server running on port ${PORT}`);
  });

