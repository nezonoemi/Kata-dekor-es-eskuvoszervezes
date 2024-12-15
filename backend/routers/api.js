// routers/api.js
import express from 'express';
import pool from '../config/db.js';  // Az adatbázis kapcsolat importálása

const apiRouter = express.Router();

// API végpont: tanárok lekérdezése ID alapján
apiRouter.get("/teachers/:id", async (req, res) => {
    try {
        let id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            throw new Error("Parameter 'id' must be a valid integer");
        }
        if (id < 0) {
            throw new Error("Parameter 'id' must be greater than 0");
        }

        // Az adatbázis lekérdezés
        let [result] = await pool.query("SELECT * FROM teachers WHERE id = ?;", [id]);

        res.json(result);  // JSON válasz visszaküldése
    } catch (err) {
        if (err.message.includes("Parameter 'id'")) {
            res.json({ "error": err.message });
            return;
        }

        res.status(500).json({
            "error": "Couldn't query teachers"
        });
    }
});

export default apiRouter;
