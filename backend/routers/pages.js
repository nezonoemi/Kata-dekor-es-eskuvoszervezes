import express from 'express';
import path from 'path';

const router = express.Router();
const __dirname = path.resolve();

// Dinamikus oldalak
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..','frontend','src','html','index.html'));
});

router.get('/autodekoracio', (req, res) => {
    res.sendFile(path.join(__dirname, '..','frontend','src','html', 'autodekoracio.html'));
});

router.get('/bemutatotermunk', (req, res) => {
    res.sendFile(path.join(__dirname, '..','frontend','src','html', 'bemutatotermunk.html'));
});
router.get('/egyeb', (req, res) => {
    res.sendFile(path.join(__dirname,'..', 'frontend','src','html', 'egyeb.html'));
});
router.get('/eskuvoszervezes', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend','src','html', 'eskuvoszervezes.html'));
});
router.get('/kapcsolat', (req, res) => {
    res.sendFile(path.join(__dirname,'..', 'frontend', 'src','html','kapcsolat.html'));
});
router.get('/order', (req, res) => {
    res.sendFile(path.join(__dirname,'..', 'frontend','src','html', 'order.html'));
});
router.get('/rendezvenyszervezes', (req, res) => {
    res.sendFile(path.join(__dirname, '..','frontend','src','html', 'rendezvenyszervezes.html'));
});
router.get('/szezonalistermekek', (req, res) => {
    res.sendFile(path.join(__dirname,'..', 'frontend', 'src','html','szezonalistermekek.html'));
});
router.get('/teremdiszites', (req, res) => {
    res.sendFile(path.join(__dirname, '..','frontend','src','html', 'teremdiszites.html'));
});
router.get('/viragkoteszet', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend','src','html', 'viragkoteszet.html'));
});
router.get('/berelhetotermekek', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend','src','html', 'berelhetotermekek.html'));
});
router.get('/arajanlatkeres', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend','src','html', 'arajanlatkeres.html'));
});
export default router;
