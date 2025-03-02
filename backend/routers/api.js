import express from 'express';
import pool from '../config/db.js';  

const apiRouter = express.Router();

// get kérés ajánlat lekérdezése
apiRouter.get("/quote_request/:id?", async (req, res) => {
    try {
        let id = req.params.id ? parseInt(req.params.id) : null; 

        if (id !== null && isNaN(id)) {
            throw new Error("Parameter 'ajanlatkeres' must be a valid integer");
        }
        if (id !== null && id < 0) {
            throw new Error("Parameter 'ajanlatkeres' must be greater than 0");
        }

        // Ha nincs id megadva, akkor az összes ajánlatot kérjük le
        if (id === null) {  
            const [results, ] = await pool.query(`SELECT 
                quote_request.quote_request_id,
                quote_request.last_name,
                quote_request.first_name,
                quote_request.email,
                quote_request.note
                FROM quote_request;`);
            res.json(results);
        } else {
            // Ha van id, akkor az adott rekordot kérjük le
            const [results, ] = await pool.query(`SELECT 
                quote_request.quote_request_id,
                quote_request.last_name,
                quote_request.first_name,
                quote_request.email,
                quote_request.note
                FROM quote_request
                WHERE quote_request.quote_request_id = ?;`, [id] 
            );
            res.json(results);  
        }
    } catch (err) {
        res.status(500).json({
            "error": "Couldn't query offers"
        });
    }
});

// delete ajánlat törlése
apiRouter.delete("/quote_request/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new Error("Invalid 'id' must be a valid integer");
        }
        if (id < 1) {
            throw new Error("Invalid 'id' must be greater than 1");
        }
        // Törlés
        const [result, ] = await pool.query(
            "DELETE FROM quote_request WHERE quote_request.quote_request_id = ?", [id]
        );
        
        if (result.affectedRows < 1) {
            throw new Error("No ajanlatkeres found with given id");
        }
        res.status(200).json({
            "id": id
        });
    } catch (err) {
        if (err.message.includes("Invalid")) {
            res.status(400).json({ "error": err.message });
            return;
        }
        if (err.message.includes("No ajanlatkeres")) {
            res.status(404).json({ "error": err.message });
            return;
        }
        res.status(500).json({
            "error": "Couldn't deletion ajanlatkeres table"
        });
    }
});

// post kérés  ajánlat létrehozása
apiRouter.post("/quote_request", async (req, res) => {
    try {
        const body = req.body;
        if (!body || typeof body !== "object" || Object.keys(body).length !== 4) {
            throw new Error("Invalid request body");
        }
        if (!body.first_name || typeof body.first_name !== "string") {
            throw new Error("Invalid 'first_name' field");
        }
        if (!body.last_name || typeof body.last_name !== "string") {
            throw new Error("Invalid 'last_name' field");
        }
        if (!body.email || typeof body.email !== "string") {
            throw new Error("Invalid 'email' field");
        }
        if (!body.note || typeof body.note !== "string") {
            throw new Error("Invalid 'note' field");
        }
        
        const { first_name, last_name, email, note } = body;
        const [result, ] = await pool.query(
            "INSERT INTO quote_request (last_name, first_name, email, note) VALUES (?, ?, ?, ?);",
            [last_name, first_name, email, note]
        );

        res.status(201).json(result);
    } catch (err) {
        if (err.message.includes("Invalid")) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(500).json({
            "error": "Couldn't insert into ajanlatkeres table"
        });
    }
});

// put kérés ajánlat módosítása
apiRouter.put("/quote_request/:id", async (req, res) => {  
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new Error("Parameter 'id' must be a valid integer");
        }
        if (id < 1) {
            throw new Error("Parameter 'id' must be greater than 0");
        }

        const body = req.body;
        if (!body || typeof body !== "object" || Object.keys(body).length !== 4) {
            throw new Error("Invalid request body");
        }
        if (!body.first_name || typeof body.first_name !== "string") {
            throw new Error("Invalid 'first_name' field");
        }
        if (!body.last_name || typeof body.last_name !== "string") {
            throw new Error("Invalid 'last_name' field");
        }
        if (!body.email || typeof body.email !== "string") {
            throw new Error("Invalid 'email' field");
        }
        if (!body.note || typeof body.note !== "string") {
            throw new Error("Invalid 'note' field");
        }
        
        const { first_name, last_name, email, note } = body;

        const [result, ] = await pool.query(
            "UPDATE quote_request SET last_name = ?, first_name = ?, email = ?, note = ? WHERE quote_request_id = ?;",
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
