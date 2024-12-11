import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Példa: teachers lekérése az adatbázisból
router.get('/teahers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM teachers');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

// Például egy API az oldalak adataival
router.get('/pages', (req, res) => {
    const pages = [
        { path: '/', title: 'Főoldal' },
        { path: '/arajanlat', title: 'Árajánlat' },
        { path: '/bemutatotemunk', title: 'Bemutatótermünk' },
        { path: '/berelhetotermekek', title: 'Bérelhető termékek' },
        { path: '/egyeb', title: 'Egyeb' },
        { path: '/eskuvoszervezes', title: 'Esküvőszervezés' },
        { path: '/kapcsolat', title: 'Kapcsolat' },
        { path: '/szezonalistermekek', title: 'Szezonálistermékek' },
        { path: '/teremdiszites', title: 'Teremdíszítés' },
        { path: '/viragkoteszet', title: 'Virágkötészet' },
    ];
    res.json(pages);
});
export default router;
