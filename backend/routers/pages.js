import express from 'express';
import path from 'path';

const router = express.Router();
const __dirname = path.resolve();

// Dinamikus oldalak
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

router.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'about.html'));
});

router.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'contact.html'));
});

export default router;
