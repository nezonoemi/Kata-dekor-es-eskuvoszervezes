import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Példa: felhasználók lekérése az adatbázisból
router.get('/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

export default router;
