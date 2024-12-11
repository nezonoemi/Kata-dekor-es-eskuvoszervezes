import express from 'express';
import pool from '../config/db.js';

const router = express.Router();
router.get("/teachers/:id", async (req, res) =>{
    try{
         //kiszedtük az id-t params taralmazza az utvonal paramétereket lehet több is akár
         //a szöveget át konvertálja hogy 1 number legyen azért 
         //kell mert az adatbázisnak szám kell minde féle képpen
        let id = parseInt(req.params.id); 
        // ha a parseInt-et nem sikerült át konvertálni és ha isNan(id) akkor nem szám
        if(isNaN(id)){
            throw new Error("Parameter 'id' must be a valid integer");
        }
        // nem lehet nulla az idnél
        if(id < 0){
            throw new Error("Parameter 'id' must be greater than 0");
        }
        // kérdőjel helyére mit illesztjen be --> [id]
        let [result, ] = await pool.query("SELECT * FROM teachers WHERE id = ?;", [id]);

        res.json(result);
        
    }catch(err){
        //hibákat ellenörzünk ugyan ez mint ez ellőti
        if(err.message.includes("Parameter 'id'")){
            res.json({
                "error" : err.message
            });
            return;
        }
        //fallback ugyan az mint ez ellőti
        res.status(500).json({
            "error" : "Couldn't query teachers"
        });
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
