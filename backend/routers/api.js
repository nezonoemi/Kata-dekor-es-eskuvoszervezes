import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";


const apiRouter = express.Router();

// quote_request lekérdezése
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
apiRouter.delete("/quote_request", async (req, res) => {
    try {
        const email = req.query.email; 

        if (!email || typeof email !== "string") {
            throw new Error("Invalid 'email' must be a valid string");
        }

        // Törlés
        const [result] = await pool.query(
            "DELETE FROM quote_request WHERE email = ?;", [email]
        );

        if (result.affectedRows === 0) {
            throw new Error("No quote_request found with given email");
        }

        res.status(200).json({ 
            message: "Ajánlat sikeresen törölve", email 
        });

    } catch (err) {
        if (err.message.includes("Invalid")) {
            res.status(400).json({ 
                error: err.message 
            });
            return;
        }
        if (err.message.includes("No quote_request")) {
            res.status(404).json({ 
                error: err.message 
            });
            return;
        }
        res.status(500).json({ error: "Couldn't delete from quote_request table" });
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
            res.status(400).json({ 
                "error": err.message 
            });
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


// rentable_pruducts lekérdezése
// get kérés
apiRouter.get("/rentable_products/:id?", async (req, res) => {
    try {
        let id = req.params.id ? parseInt(req.params.id) : null;

        if (id !== null && isNaN(id)) {
            throw new Error("Parameter 'id' must be a valid integer");
        }
        if (id !== null && id < 1) {
            throw new Error("Parameter 'id' must be greater than 0");
        }

        if (id === null) {
            const [results] = await pool.query(`
                SELECT * FROM rentable_products;
            `);
            res.json(results);
        } else {
            const [results] = await pool.query(`
                SELECT * FROM rentable_products WHERE rentable_products.rentable_id = ?;`, 
                [id]);
            res.json(results);
        }
    } catch (err) {
        res.status(500).json({
            "error": "Couldn't query rentable_products"
        });
    }
});

// delet kérés
apiRouter.delete("/rentable_products/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new Error("Invalid 'id' must be a valid integer");
        }
        if (id < 1) {
            throw new Error("Invalid 'id' must be greater than 1");
        }
        const [result] = await pool.query(
            "DELETE FROM rentable_products WHERE rentable_products.rentable_id = ?;",
            [id]
        );
        if (result.affectedRows < 1) {
            throw new Error("No rentable_products found with given id");
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
        if (err.message.includes("No rentable_products")) {
             res.status(404).json({ 
                "error": err.message 
            });
            return;
        }
        res.status(500).json({
            "error": "Couldn't delete from rentable_products table"
        });
    }
});

// post kérés
apiRouter.post("/rentable_products", async (req, res) => {
    try {
        const body = req.body;
        if (!body || typeof body !== "object" || Object.keys(body).length !== 3) {
            throw new Error("Invalid request body");
        }
        if (!body.product_name || typeof body.product_name !== "string") {
            throw new Error("Invalid 'product_name' field");
        }
        if (body.product_price === undefined || typeof body.product_price !== "number") {
            throw new Error("Invalid 'product_price' field");
        }
        if (!body.product_description || typeof body.product_description !== "string") {
            throw new Error("Invalid 'product_description' field");
        }
        
        const { product_name, product_price, product_description } = body;
        const [result] = await pool.query(
            "INSERT INTO rentable_products (rentable_products.product_name, rentable_products.product_price, rentable_products.product_description) VALUES (?, ?, ?);",
            [product_name, product_price, product_description]
        );

        res.status(201).json(result);
    } catch (err) {
        if (err.message.includes("Invalid")) {
            res.status(400).json({ 
                "error": err.message 
            });
            return;
        }
        res.status(500).json({
            "error": "Couldn't insert into rentable_products table"
        });
    }
});

// put kérés
apiRouter.put("/rentable_products/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new Error("Parameter 'id' must be a valid integer");
        }
        if (id < 1) {
            throw new Error("Parameter 'id' must be greater than 0");
        }

        const body = req.body;
        if (!body || typeof body !== "object" || Object.keys(body).length !== 3) {
            throw new Error("Invalid request body");
        }
        if (!body.product_name || typeof body.product_name !== "string") {
            throw new Error("Invalid 'product_name' field");
        }
        if (body.product_price === undefined || typeof body.product_price !== "number") {
            throw new Error("Invalid 'product_price' field");
        }
        if (!body.product_description || typeof body.product_description !== "string") {
            throw new Error("Invalid 'product_description' field");
        }
        
        const { product_name, product_price, product_description } = body;
        const [result] = await pool.query(
            "UPDATE rentable_products SET rentable_products.product_name = ?, rentable_products.product_price = ?, rentable_products.product_description = ? WHERE rentable_products.rentable_product_id = ?;",
            [product_name, product_price, product_description, id]
        );
        if (result.affectedRows < 1) {
            throw new Error("No rentable_products found with given id");
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
        if (err.message.includes("No rentable_products")) {
            res.status(404).json({ 
                "error": err.message 
            });
            return;
        }
        res.status(500).json({
            "error": "Couldn't update rentable_products table"
        });
    }
});

// user tábla lekérdezések
// get kérés
apiRouter.get("/user/:id?", async (req, res) => {
    try {
        let id = req.params.id ? parseInt(req.params.id) : null;
        
        if (id !== null && isNaN(id)) {
            throw new Error("Parameter 'id' must be a valid integer");
        }
        if (id !== null && id < 1) {
            throw new Error("Parameter 'id' must be greater than 0");
        }
        
        if (id === null) {
            const [results] = await pool.query("SELECT * FROM user;");
            res.json(results);
        } else {
            const [results] = await pool.query("SELECT * FROM user WHERE user.user_id = ?;", [id]);
            res.json(results);
        }
    } catch (err) {
        res.status(500).json({ 
            "error": "Couldn't query user" 
        });
    }
});

apiRouter.delete("/user/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new Error("Invalid 'id' must be a valid integer");
        }
        if (id < 1) {
            throw new Error("Invalid 'id' must be greater than 0");
        }
        
        const [result] = await pool.query("DELETE FROM user WHERE user.user_id = ?;", [id]);
        
        if (result.affectedRows < 1) {
            throw new Error("No user found with given id");
        }
        
        res.status(200).json({ "id": id });
    } catch (err) {
        if (err.message.includes("Invalid")) {
            res.status(400).json({ 
                "error": err.message 
            });
            return;
        }
        if (err.message.includes("No user")) {
            res.status(404).json({ 
                "error": err.message 
            });
            return;
        }
        res.status(500).json({ 
            "error": "Couldn't delete from user table" 
        });
    }
});

apiRouter.post("/user", async (req, res) => {
    try {
        const body = req.body;
        if (!body || typeof body !== "object" || Object.keys(body).length !== 5) {
            throw new Error("Invalid request body");
        }
        if (!body.last_name || typeof body.last_name !== "string") {
            throw new Error("Invalid 'last_name' field");
        }
        if (!body.first_name || typeof body.first_name !== "string") {
            throw new Error("Invalid 'first_name' field");
        }
        if (!body.email || typeof body.email !== "string") {
            throw new Error("Invalid 'email' field");
        }
        if (!body.password || typeof body.password !== "string") {
            throw new Error("Invalid 'password' field");
        }
        if (!body.phone_number || (typeof body.phone_number !== "string" && typeof body.phone_number !== "number")) {
            throw new Error("Invalid 'phone_number' field");
        }
        
        const { first_name, last_name, password, email, phone_number } = body;
        const [result] = await pool.query(
            "INSERT INTO user (first_name, last_name, password, email, phone_number) VALUES (?, ?, ?, ?, ?);",
            [first_name, last_name, password, email, phone_number]
        );
        
        res.status(201).json(result);
    } catch (err) {
        if (err.message.includes("Invalid")) {
            res.status(400).json({ 
                "error": err.message 
            });
            return;
        }
        res.status(500).json({ 
            "error": "Couldn't insert into user table" 
        });
    }
});

apiRouter.put("/user/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new Error("Parameter 'id' must be a valid integer");
        }
        if (id < 1) {
            throw new Error("Parameter 'id' must be greater than 0");
        }
        
        const body = req.body;
        if (!body || typeof body !== "object" || Object.keys(body).length !== 5) {
            throw new Error("Invalid request body");
        }
        if (!body.last_name || typeof body.last_name !== "string") {
            throw new Error("Invalid 'last_name' field");
        }
        if (!body.first_name || typeof body.first_name !== "string") {
            throw new Error("Invalid 'first_name' field");
        }
        if (!body.email || typeof body.email !== "string") {
            throw new Error("Invalid 'email' field");
        }
        if (!body.password || typeof body.password !== "string") {
            throw new Error("Invalid 'password' field");
        }
        if (!body.phone_number || (typeof body.phone_number !== "string" && typeof body.phone_number !== "number")) {
            throw new Error("Invalid 'phone_number' field");
        }
        
        const { first_name, last_name, password, email, phone_number } = body;
        const [result] = await pool.query(
            "UPDATE user SET first_name = ?, last_name = ?, password = ?, email = ?, phone_number = ? WHERE user_id = ?;",
            [first_name, last_name, password, email, phone_number, id]
        );
        
        if (result.affectedRows < 1) {
            throw new Error("No user found with given id");
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
        if (err.message.includes("No user")) {
            res.status(404).json({ 
                "error": err.message 
            });
            return;
        }
        res.status(500).json({ 
            "error": "Couldn't update user table" 
        });
    }
});

//order tábla 
//get kérés

apiRouter.get("/order/:id?", async (req, res) => {
    try {
        let id = req.params.id ? parseInt(req.params.id) : null;
        
        if (id !== null && isNaN(id)) {
            throw new Error("Parameter 'id' must be a valid integer");
        }
        if (id !== null && id < 1) {
            throw new Error("Parameter 'id' must be greater than 0");
        }
        
        if (id === null) {
            const [results] = await pool.query(`
                SELECT o.order_id, u.last_name, u.first_name, u.email, u.phone_number, rp.product_name, 
                rp.product_price, rp.product_description, o.order_date FROM \`order\` o 
                JOIN user u ON o.user_id = u.user_id JOIN rentable_products rp ON o.rentable_id = rp.rentable_id;
            `);
            res.json(results);
        } else {
            const [results] = await pool.query(`
                SELECT o.order_id, u.last_name, u.first_name, u.email, u.phone_number, rp.product_name, 
                rp.product_price, rp.product_description, o.order_date FROM \`order\` o 
                JOIN user u ON o.user_id = u.user_id JOIN rentable_products rp ON o.rentable_id = rp.rentable_id
                WHERE o.order_id = ?;
            `, [id]);
            res.json(results);
        }
    } catch (err) {
        res.status(500).json({ 
            "error": "Couldn't query order" 
        });
    }
});

//delete kérés
apiRouter.delete("/order/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new Error("Invalid 'id' must be a valid integer");
        }
        if (id < 1) {
            throw new Error("Invalid 'id' must be greater than 1");
        }
        const [result] = await pool.query(
            "DELETE FROM `order` WHERE `order`.order_id = ?;",
            [id]
        );
        if (result.affectedRows < 1) {
            throw new Error("No order found with given id");
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
        if (err.message.includes("No order")) {
            res.status(404).json({ 
                "error": err.message 
            });
            return;
        }
        res.status(500).json({ 
            "error": "Couldn't delete from order table" 
        });
    }
});

//post kérés
apiRouter.post("/order", async (req, res) => {
    try {
        const body = req.body;
        if (!body || typeof body !== "object" || Object.keys(body).length !== 3) {
            throw new Error("Invalid request body");
        }
        if (body.user_id === undefined || typeof body.user_id !== "number") {
            throw new Error("Invalid 'user_id' field");
        }
        if (body.rentable_id === undefined || typeof body.rentable_id !== "number") {
            throw new Error("Invalid 'rentable_id' field");
        }
        if (!body.order_date || typeof body.order_date !== "string") {
            throw new Error("Invalid 'order_date' field");
        }
        
        const { user_id, rentable_id, order_date } = body;
        const [result] = await pool.query(
            "INSERT INTO `order` (user_id, rentable_id, order_date) VALUES (?, ?, ?);",
            [user_id, rentable_id, order_date]
        );
        res.status(201).json(result);
    } catch (err) {
        if (err.message.includes("Invalid")) {
            res.status(400).json({ 
                "error": err.message 
            });
            return;
        }
        res.status(500).json({ 
            "error": "Couldn't insert into order table" 
        });
    }
});

//put kérés
apiRouter.put("/order/:id", async (req, res) => {
   try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new Error("Parameter 'id' must be a valid integer");
        }
        if (id < 1) {
            throw new Error("Parameter 'id' must be greater than 0");
        }
        
        const body = req.body;
        if (!body || typeof body !== "object" || Object.keys(body).length !== 3) {
            throw new Error("Invalid request body");
        }
        if (body.user_id === undefined || typeof body.user_id !== "number") {
            throw new Error("Invalid 'user_id' field");
        }
        if (body.rentable_id === undefined || typeof body.rentable_id !== "number") {
            throw new Error("Invalid 'rentable_id' field");
        }
        if (!body.order_date || typeof body.order_date !== "string") {
            throw new Error("Invalid 'order_date' field");
        }
        
        const { user_id, rentable_id, order_date } = body;
        const [result] = await pool.query(
            "UPDATE `order` SET user_id = ?, rentable_id = ?, order_date = ? WHERE order_id = ?;",
            [user_id, rentable_id, order_date, id]
        );
        if (result.affectedRows < 1) {
            throw new Error("No order found with given id");
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
        if (err.message.includes("No order")) {
            res.status(404).json({ 
                "error": err.message 
            });
            return;
        }
        res.status(500).json({ 
            "error": "Couldn't update order table" 
        });
    } 
});

// regisztráció és bejelentkezés
apiRouter.post("/user", async (req, res) => {
    console.log("Beérkező kérés:", req.body); 

    const { action, first_name, last_name, phone, email, password } = req.body;

    if (!action) {
        return res.status(400).json({ error: "⚠ Az 'action' mező kötelező!" });
    }

    if (action === "register") {
        if (!first_name || !last_name || !phone || !email || !password) {
            return res.status(400).json({ error: "⚠ Minden mezőt ki kell tölteni!" });
        }

        try {
            const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
            if (existingUser.length > 0) {
                return res.status(400).json({ error: "⚠ Ez az e-mail már regisztrálva van!" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query(
                "INSERT INTO users (first_name, last_name, phone, email, password) VALUES (?, ?, ?, ?, ?)",
                [first_name, last_name, phone, email, hashedPassword]
            );

            return res.status(201).json({ message: "✅ Sikeres regisztráció!" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "❌ Hiba történt a regisztráció során!" });
        }
    }

    if (action === "login") {
        if (!email || !password) {
            return res.status(400).json({ error: "⚠ E-mail és jelszó szükséges!" });
        }

        try {
            const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
            if (users.length === 0) {
                return res.status(400).json({ error: "❌ Hibás e-mail vagy jelszó!" });
            }

            const user = users[0];
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(400).json({ error: "❌ Hibás e-mail vagy jelszó!" });
            }

            const token = jwt.sign({ userId: user.id, email: user.email }, "secret_key", { expiresIn: "1h" });

            return res.json({ message: `✅ Bejelentkezve: ${user.first_name}`, token });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "❌ Hiba történt a bejelentkezés során!" });
        }
    }

    return res.status(400).json({ error: "⚠ Hibás kérés!" });
});

export default apiRouter;