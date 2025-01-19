import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRoutes from './routers/api.js';
dotenv.config();

const app = express();
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const __dirname = path.resolve();
app.use(express.json());
app.use(cors());

// API végpontok
app.use('/api', apiRoutes);

// 404-es oldal kezelése
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'frontend', '404.html'));
});

// SSL tanúsítvány generálás vagy betöltés
const certsPath = path.join(__dirname, 'certs');
if (!fs.existsSync(certsPath)) {
    fs.mkdirSync(certsPath);
}

const keyPath = path.join(certsPath, 'key.pem');
const certPath = path.join(certsPath, 'cert.pem');

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.log('SSL certificates not found. Generating new ones...');
    const pems = selfsigned.generate(null, { days: 365 });
    fs.writeFileSync(keyPath, pems.private);
    fs.writeFileSync(certPath, pems.cert);
    console.log('New SSL certificates generated.');
}

const sslOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
};

// HTTPS szerver indítása
https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
    console.log(`HTTPS server is running on https://localhost:${HTTPS_PORT}`);
});
