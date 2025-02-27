import express from 'express';
import pool from '../config/db.js';  // Az adatbázis kapcsolat importálása

const apiRouter = express.Router();

//get kérés ajanlat kérés lekérdezése
apiRouter.get("/ajanlatkeres/:id", async (req, res) => {
    try {
        let id = parseInt(req.params.id); 

        if (isNaN(id)) {
            throw new Error("Parameter 'ajanlatkeres' must be a valid integer");
        }
        if (id < 0) {
            throw new Error("Parameter 'ajanlatkeres' must be greater than 0");
        }

        // Ha nem adtak meg ajanlatkeres_id-t, akkor az összes ajánlatot kérjük le
        if (!id) {  
            const [results] = await pool.query(`SELECT 
                ajanlatkeres.ajanlatkeres_id, 
                ajanlatkeres.vezeteknev, 
                ajanlatkeres.keresztnev, 
                ajanlatkeres.ajanlatkeres_email, 
                ajanlatkeres.ajanlatkeres_megjegyzes, 
                ajanlatkeres.termek_id 
                FROM ajanlatkeres;`);
            res.json(results);
        } else {
            // Ha van ajanlatkeres_id, akkor az adott ajánlatot kérjük le
            const [results] = await pool.query(`SELECT 
                ajanlatkeres.ajanlatkeres_id, 
                ajanlatkeres.vezeteknev, 
                ajanlatkeres.keresztnev, 
                ajanlatkeres.ajanlatkeres_email, 
                ajanlatkeres.ajanlatkeres_megjegyzes, 
                ajanlatkeres.termek_id 
                FROM ajanlatkeres 
                WHERE ajanlatkeres.ajanlatkeres_id = ?;`, [id]  
            );
            res.json(results);  
        }
    } catch (err) {
        res.status(500).json({
            "error": "Couldn't query offers"
        });
    }
});

//delete hogy töröljük az ajanlatkerest
apiRouter.delete("/ajanlatkeres/:id", async (req, res)=>{
    try{
        const id = parseInt(req.params.id);
        if(isNaN(id)){
            throw new Error("Invalid 'id' must be a valid integer");
        }
        // nem lehet nulla az idnél
        if(id < 1){
            throw new Error("Indvalid 'id' must be greater than 1");
        }
        //törlés
        const [result] = await pool.query(
            "DELETE FROM ajanlatkeres where ajanlatkeres_id = ?", [id]
        );
        
        if(result.affectedRows < 1){
            throw new("No ajanlatkeres found with given id");
        }
        res.status(200).json({
            "id": id
        });

    }catch(err){
        if (err.message.includes("Invalid")){
            res.status(400).json({
                "error" : err.message
            });
            return;
        }
        if (err.message.includes("No ajanlatkeres")){
            res.status(404).json({
                "error" : err.message
            });
            return;
        }
        res.status(500).json({
            "error" : "Couldn't ajanlatkeres table"
        });
    }
});


export default apiRouter;
