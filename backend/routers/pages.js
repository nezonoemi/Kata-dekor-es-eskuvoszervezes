import express from 'express';
import path from 'path';

const router = express.Router();
const __dirname = path.resolve();

// Statikus fájlok szolgáltatása (HTML fájlok)
router.use(express.static(path.join(__dirname, '..', 'frontend', 'src', 'html')));

// Dinamikus oldalak
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'src', 'html', 'index.html'));
});

// Oldalak dinamikusan
const pages = [
    'autodekoracio',
    'bemutatotermunk',
    'egyeb',
    'eskuvoszervezes',
    'kapcsolat',
    'order',
    'rendezvenyszervezes',
    'szezonalistermekek',
    'teremdiszites',
    'viragkoteszet',
    'berelhetotermekek',
    'arajanlatkeres'
];

// Dinamikus útvonalak létrehozása
pages.forEach(page => {
    router.get(`/${page}`, (req, res) => {
        // A page változó értéke alapján dinamikusan adunk vissza HTML fájlt
        res.sendFile(path.join(__dirname, '..', 'frontend', 'src', 'html', `${page}.html`));
    });
});

// Minden egyéb kérésre alapértelmezett oldal visszaadása
router.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'src', 'html', 'index.html'));
});

export default router;
