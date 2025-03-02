import express from 'express';
import pool from '../config/db.js';  // Az adatbázis kapcsolat importálása

const apiRouter = express.Router();

//get kérés ajanlat kérés lekérdezése
apiRouter.get("/qoute_request/:id", async (req, res) => {
    try {
        let id = parseInt(req.query.id); 

        if (isNaN(id)) {
            throw new Error("Parameter 'ajanlatkeres' must be a valid integer");
        }
        if (id < 0) {
            throw new Error("Parameter 'ajanlatkeres' must be greater than 0");
        }

        // Ha nem adtak meg ajanlatkeres_id-t, akkor az összes ajánlatot kérjük le
        if (!id) {  
            const [results] = await pool.query(`SELECT 
                qoute_request.qute_request_id,
                qoute_request.last_name,
                qoute_request.first_name,
                qoute_request.email,
                qoute_request.note,
                ajanlatkeres.product_id
                FROM qoute_request;`);
            res.json(results);
        } else {
            // Ha van ajanlatkeres_id, akkor az adott ajánlatot kérjük le
            const [results] = await pool.query(`SELECT 
                qoute_request.qute_request_id,
                qoute_request.last_name,
                qoute_request.first_name,
                qoute_request.email,
                qoute_request.note,
                ajanlatkeres.product_id
                FROM qoute_request
                WHERE qoute_request.qute_request_id = ?;`, [id] 
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
apiRouter.delete("/qoute_request/:id", async (req, res)=>{
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
            "DELETE FROM qoute_request where qoute_request.qoute_request_id = ?", [id]
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

//post kérés ajanlat kérés létrehozása
apiRouter.post("/qoute_request", async (req, res) => {
    try {
        const body = req.body;
        if(!body || typeof(body) !== "object" || Object.keys(body).length !== 5){
            throw new Error("Invalid request body");
        }
        if(!body.first_name || typeof(body.first_name) !== "string"){
            throw new Error("Invalid 'first_name' field");

        }
        if(!body.last_name || typeof(body.last_name) !== "string"){
            throw new Error("Invalid 'last_name' field");
        }
        if(!body.email || typeof(body.email) !== "string"){
            throw new Error("Invalid 'email' field");
        }
        if(!body.note || typeof(body.note) !== "string"){
            throw new Error("Invalid 'note' field");
        }
        if(body.qoute_request_id < 0){
            throw new Error("Invalid 'qoute_request_id' must be pozitive number");
        }
       

        const [result] = await pool.query(
            "INSERT INTO qoute_request (last_name, first_name, email, note) VALUES (?, ?, ?, ?);",
            [last_name, first_name, email, note]
        );

        res.status(201).json({
            "id": result.qoute_request_id
        });
    } catch (err) {
        if (err.message.includes("Invalid")){
            res.status(400).json({
                "error" : err.message
            });
            return;
        }
        res.status(500).json({
            "error": "Couldn't insert into ajanlatkeres table"
        });
    }
});

//put kérés ajanlat kérés módosítása
apiRouter.put("/qoute_request/:id", async (req, res) => {  
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new Error("Parameter 'id' must be a valid integer");
        }
        if (id < 1) {
            throw new Error("Parameter 'id' must be greater than 0");
        }

        const body = req.body;
        if (!body || typeof(body) !== "object" || Object.keys(body).length !== 5) {
            throw new Error("Invalid request body");
        }
        if (!body.first_name || typeof(body.first_name) !== "string") {
            throw new Error("Invalid 'first_name' field");
        }
        if (!body.last_name || typeof(body.last_name) !== "string") {
            throw new Error("Invalid 'last_name' field");
        }
        if (!body.email || typeof(body.email) !== "string") {
            throw new Error("Invalid 'email' field");
        }
        if (!body.note || typeof(body.note) !== "string") {
            throw new Error("Invalid 'note' field");
        }
        if (body.qoute_request_id < 0) {
            throw new Error("Invalid 'qoute_request_id' must be a positive number");
        }

        const [result] = await pool.query(
            "UPDATE qoute_request SET last_name = ?, first_name = ?, email = ?, note = ? WHERE qoute_request_id = ?;",
            [last_name, first_name, email, note, id]
        );

        if (result.affectedRows < 1) {
            throw new Error("No ajanlatkeres found with given id");
        }

        res.status(200).json({
            "id": id
        });
    } catch (err) {
        if (err.message.includes("Invalid")) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }
        if (err.message.includes("No ajanlatkeres")) {
            res.status(404).json({
                "error": err.message
            });
            return;
        }
        res.status(500).json({
            "error": "Couldn't update ajanlatkeres table"
        });
    }
});
export default apiRouter;
