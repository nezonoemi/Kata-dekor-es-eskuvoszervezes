import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { pool } from "../config/db.js";

const apiRouter = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send email function
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("E-mail sikeresen elküldve:", info.response);
    return info.response;
  } catch (error) {
    console.error("Hiba történt az e-mail küldés közben:", error);
    throw new Error("E-mail küldés hiba: " + error.message);
  }
};

apiRouter.post("/quote_request", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log("Authorization header:", authHeader); 

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Hiányzó vagy hibás autentikációs fejléc"); 
      return res.status(401).json({ error: "🔒 Hiányzó vagy hibás autentikációs fejléc!" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token); 

    if (!token) {
      console.log("Hiányzó token"); 
      return res.status(401).json({ error: "🔒 Hiányzó token!" });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || "secret");
      console.log("Dekódolt token:", decodedToken); 
    } catch (err) {
      console.log("Érvénytelen vagy lejárt token:", err); 
      return res.status(401).json({ error: "❌ Érvénytelen vagy lejárt token!" });
    }
    const { last_name, first_name, email, note } = req.body;

    if (!last_name || !first_name || !email || !note) {
      return res.status(400).json({ error: "Minden mező kitöltése kötelező!" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Érvénytelen e-mail cím!" });
    }

    const emailSubject = `Új ajánlatkérés: ${last_name} ${first_name}`;
    const emailText = `Kedves Admin!\n\nÚj ajánlatkérés érkezett:\nNév: ${last_name} ${first_name}\nEmail: ${email}\nÜzenet: ${note}`;

    try {
      await sendEmail(email, emailSubject, emailText);
    } catch (err) {
      console.error("Hiba történt az értesítés küldésekor:", err);
      return res
        .status(500)
        .json({ error: "Nem sikerült az értesítést elküldeni." });
    }

    const [result] = await pool.query(
      "INSERT INTO quote_request (last_name, first_name, email, note) VALUES (?, ?, ?, ?);",
      [last_name, first_name, email, note],
    );

    res.status(201).json({ result, message: "Ajánlat sikeresen elküldve!" });
  } catch (err) {
    console.error("Hiba:", err.message);
    res.status(500).json({ error: "Nem sikerült az ajánlatot feldolgozni." });
  }
});

// rentable_pruducts lekérdezése
// delet kérés
apiRouter.delete("/rentable_products/:id", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log("Authorization header:", authHeader); 

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Hiányzó vagy hibás autentikációs fejléc"); 
      return res.status(401).json({ error: "🔒 Hiányzó vagy hibás autentikációs fejléc!" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token); 

    if (!token) {
      console.log("Hiányzó token"); 
      return res.status(401).json({ error: "🔒 Hiányzó token!" });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || "secret");
      console.log("Dekódolt token:", decodedToken); 
    } catch (err) {
      console.log("Érvénytelen vagy lejárt token:", err); 
      return res.status(401).json({ error: "❌ Érvénytelen vagy lejárt token!" });
    }
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new Error("Invalid 'id' must be a valid integer");
    }
    if (id < 1) {
      throw new Error("Invalid 'id' must be greater than 1");
    }
    const [result] = await pool.query(
      "DELETE FROM rentable_products WHERE rentable_products.rentable_id = ?;",
      [id],
    );
    if (result.affectedRows < 1) {
      throw new Error("No rentable_products found with given id");
    }
    res.status(200).json({
      id: id,
    });
  } catch (err) {
    if (err.message.includes("Invalid")) {
      res.status(400).json({
        error: err.message,
      });
      return;
    }
    if (err.message.includes("No rentable_products")) {
      res.status(404).json({
        error: err.message,
      });
      return;
    }
    res.status(500).json({
      error: "Couldn't delete from rentable_products table",
    });
  }
});

// post kérés
apiRouter.post("/rentable_products", async (req, res) => {
  const authHeader = req.headers["authorization"];
    console.log("Authorization header:", authHeader); 

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Hiányzó vagy hibás autentikációs fejléc"); 
      return res.status(401).json({ error: "🔒 Hiányzó vagy hibás autentikációs fejléc!" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token); 

    if (!token) {
      console.log("Hiányzó token"); 
      return res.status(401).json({ error: "🔒 Hiányzó token!" });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || "secret");
      console.log("Dekódolt token:", decodedToken); 
    } catch (err) {
      console.log("Érvénytelen vagy lejárt token:", err); 
      return res.status(401).json({ error: "❌ Érvénytelen vagy lejárt token!" });
    }
  try {
    const body = req.body;
    if (!body || typeof body !== "object" || Object.keys(body).length !== 2) {
      throw new Error("Invalid request body");
    }
    if (!body.product_name || typeof body.product_name !== "string") {
      throw new Error("Invalid 'product_name' field");
    }
    if (
      body.product_price === undefined ||
      typeof body.product_price !== "number"
    ) {
      throw new Error("Invalid 'product_price' field");
    }

    const { product_name, product_price } = body;
    const [result] = await pool.query(
      "INSERT INTO rentable_products (rentable_products.product_name, rentable_products.product_price) VALUES (?, ?);",
      [product_name, product_price],
    );

    res.status(201).json(result);
  } catch (err) {
    if (err.message.includes("Invalid")) {
      res.status(400).json({
        error: err.message,
      });
      return;
    }
    res.status(500).json({
      error: "Couldn't insert into rentable_products table",
    });
  }
});

// put kérés
apiRouter.put("/rentable_products/:id", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log("Authorization header:", authHeader); 

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Hiányzó vagy hibás autentikációs fejléc"); 
      return res.status(401).json({ error: "🔒 Hiányzó vagy hibás autentikációs fejléc!" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token); 

    if (!token) {
      console.log("Hiányzó token"); 
      return res.status(401).json({ error: "🔒 Hiányzó token!" });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || "secret");
      console.log("Dekódolt token:", decodedToken); 
    } catch (err) {
      console.log("Érvénytelen vagy lejárt token:", err); 
      return res.status(401).json({ error: "❌ Érvénytelen vagy lejárt token!" });
    }
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new Error("Parameter 'id' must be a valid integer");
    }
    if (id < 1) {
      throw new Error("Parameter 'id' must be greater than 0");
    }

    const body = req.body;
    if (!body || typeof body !== "object" || Object.keys(body).length !== 2) {
      throw new Error("Invalid request body");
    }
    if (!body.product_name || typeof body.product_name !== "string") {
      throw new Error("Invalid 'product_name' field");
    }
    if (
      body.product_price === undefined ||
      typeof body.product_price !== "number"
    ) {
      throw new Error("Invalid 'product_price' field");
    }

    const { product_name, product_price } = body;
    const [result] = await pool.query(
      "UPDATE rentable_products SET rentable_products.product_name = ?, rentable_products.product_price = ? WHERE rentable_products.rentable_product_id = ?;",
      [product_name, product_price, id],
    );
    if (result.affectedRows < 1) {
      throw new Error("No rentable_products found with given id");
    }
    res.status(200).json({
      id: id,
    });
  } catch (err) {
    if (err.message.includes("Invalid")) {
      res.status(400).json({
        error: err.message,
      });
      return;
    }
    if (err.message.includes("No rentable_products")) {
      res.status(404).json({
        error: err.message,
      });
      return;
    }
    res.status(500).json({
      error: "Couldn't update rentable_products table",
    });
  }
});

// user tábla lekérdezések
apiRouter.delete("/user/:id", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log("Authorization header:", authHeader); 

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Hiányzó vagy hibás autentikációs fejléc"); 
      return res.status(401).json({ error: "🔒 Hiányzó vagy hibás autentikációs fejléc!" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token); 

    if (!token) {
      console.log("Hiányzó token"); 
      return res.status(401).json({ error: "🔒 Hiányzó token!" });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || "secret");
      console.log("Dekódolt token:", decodedToken); 
    } catch (err) {
      console.log("Érvénytelen vagy lejárt token:", err); 
      return res.status(401).json({ error: "❌ Érvénytelen vagy lejárt token!" });
    }
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new Error("Invalid 'id' must be a valid integer");
    }
    if (id < 1) {
      throw new Error("Invalid 'id' must be greater than 0");
    }

    const [result] = await pool.query(
      "DELETE FROM user WHERE user.user_id = ?;",
      [id],
    );

    if (result.affectedRows < 1) {
      throw new Error("No user found with given id");
    }

    res.status(200).json({ id: id });
  } catch (err) {
    if (err.message.includes("Invalid")) {
      res.status(400).json({
        error: err.message,
      });
      return;
    }
    if (err.message.includes("No user")) {
      res.status(404).json({
        error: err.message,
      });
      return;
    }
    res.status(500).json({
      error: "Couldn't delete from user table",
    });
  }
});

apiRouter.post("/user", async (req, res) => {
  try {
    const body = req.body;
    if (body.action === "register") {
      if (!body || typeof body !== "object" || Object.keys(body).length !== 6) {
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
      if (!body.phone || typeof body.phone !== "string") {
        throw new Error("Invalid 'phone' field");
      }

      const { first_name, last_name, password, email, phone } = body;

      const hashedPassword = await bcrypt.hash(password, 14);

      const [result] = await pool.query(
        "INSERT INTO user (first_name, last_name, password, email, phone_number) VALUES (?, ?, ?, ?, ?);",
        [first_name, last_name, hashedPassword, email, phone],
      );

      res.status(201).json(result);
    }

    if (body.action === "login") {
      const [users] = await pool.query("SELECT * FROM user WHERE email = ?", [
        body.email,
      ]);

      if (users.length === 0) {
        return res.status(400).json({ error: "❌ Hibás e-mail vagy jelszó!" });
      }

      const user = users[0];

      const isPasswordValid = await bcrypt.compare(
        body.password,
        user.password,
      );

      if (!isPasswordValid) {
        return res.status(400).json({ error: "❌ Hibás e-mail vagy jelszó!" });
      }

      console.log("User before token sign:", user);

      const token = jwt.sign(
        { userId: user.user_id, email: user.email, phone: user.phone_number },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "2h" }
      );

      res.json({
        message: `✅ Sikeres bejelentkezés, ${user.first_name}!`,
        token,
      });
    }
  } catch (err) {
    if (err.message.includes("Invalid")) {
      res.status(400).json({
        error: err.message,
      });
      return;
    }
    res.status(500).json({
      error: "Couldn't insert into user table",
    });
  }
});

apiRouter.put("/user/:id", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log("Authorization header:", authHeader); 

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Hiányzó vagy hibás autentikációs fejléc"); 
      return res.status(401).json({ error: "🔒 Hiányzó vagy hibás autentikációs fejléc!" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token); 

    if (!token) {
      console.log("Hiányzó token"); 
      return res.status(401).json({ error: "🔒 Hiányzó token!" });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || "secret");
      console.log("Dekódolt token:", decodedToken); 
    } catch (err) {
      console.log("Érvénytelen vagy lejárt token:", err); 
      return res.status(401).json({ error: "❌ Érvénytelen vagy lejárt token!" });
    }
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
    if (
      !body.phone_number ||
      (typeof body.phone_number !== "string" &&
        typeof body.phone_number !== "number")
    ) {
      throw new Error("Invalid 'phone_number' field");
    }

    const { first_name, last_name, password, email, phone_number } = body;
    const [result] = await pool.query(
      "UPDATE user SET first_name = ?, last_name = ?, password = ?, email = ?, phone_number = ? WHERE user_id = ?;",
      [first_name, last_name, password, email, phone_number, id],
    );

    if (result.affectedRows < 1) {
      throw new Error("No user found with given id");
    }

    res.status(200).json({
      id: id,
    });
  } catch (err) {
    if (err.message.includes("Invalid")) {
      res.status(400).json({
        error: err.message,
      });
      return;
    }
    if (err.message.includes("No user")) {
      res.status(404).json({
        error: err.message,
      });
      return;
    }
    res.status(500).json({
      error: "Couldn't update user table",
    });
  }
});

//order tábla
//delete kérés
apiRouter.delete("/order/:id", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log("Authorization header:", authHeader); 

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Hiányzó vagy hibás autentikációs fejléc"); 
      return res.status(401).json({ error: "🔒 Hiányzó vagy hibás autentikációs fejléc!" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token); 

    if (!token) {
      console.log("Hiányzó token"); 
      return res.status(401).json({ error: "🔒 Hiányzó token!" });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || "secret");
      console.log("Dekódolt token:", decodedToken); 
    } catch (err) {
      console.log("Érvénytelen vagy lejárt token:", err); 
      return res.status(401).json({ error: "❌ Érvénytelen vagy lejárt token!" });
    }
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new Error("Invalid 'id' must be a valid integer");
    }
    if (id < 1) {
      throw new Error("Invalid 'id' must be greater than 1");
    }
    const [result] = await pool.query(
      "DELETE FROM `orders` WHERE `orders`.order_id = ?;",
      [id],
    );
    if (result.affectedRows < 1) {
      throw new Error("No order found with given id");
    }
    res.status(200).json({
      id: id,
    });
  } catch (err) {
    if (err.message.includes("Invalid")) {
      res.status(400).json({
        error: err.message,
      });
      return;
    }
    if (err.message.includes("No order")) {
      res.status(404).json({
        error: err.message,
      });
      return;
    }
    res.status(500).json({
      error: "Couldn't delete from order table",
    });
  }
});

//post kérés
apiRouter.post("/order", async (req, res) => {
  try {
    const { cart, userData } = req.body;

    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      throw new Error("Authentication required.");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new Error("Authentication required.");
    }

    const decodedToken = jwt.decode(token, "secret");

    if (!decodedToken.userId || !Array.isArray(cart) || cart.length === 0) {
      return res
        .status(400)
        .json({ error: "Hiányzó vagy érvénytelen rendelési adatok!" });
    }

    const body = req.body;
    if (!body || typeof body !== "object" || Object.keys(body).length !== 2) {
      throw new Error("Invalid request body");
    }
    if (!body.userData.city || typeof body.userData.city !== "string") {
      throw new Error("Invalid 'street' field");
    }
    if (!body.userData.street || typeof body.userData.street !== "string") {
      throw new Error("Invalid 'street' field");
    }
    if (!body.userData.zip || typeof body.userData.zip !== "number") {
      throw new Error("Invalid 'zip' field");
    }
    if (
      !body.userData.phone ||
      typeof body.userData.phone !== "number"
    ) {
      throw new Error("Invalid 'phone_number' field");
    }
    const orderDate = new Date();
    const orderIds = [];

    for (const item of cart) {
      const [orderResult] = await pool.query(
        "INSERT INTO `orders` (user_id, rentable_id, phone_number, city, street, zip, order_date) VALUES (?, ?, ?, ?, ?, ?, ?);",
        [decodedToken.userId, item.productId, body.userData.phone, body.userData.city, body.userData.street,
        body.userData.zip, orderDate],
      );
      orderIds.push(orderResult.insertId);
    }

    try {
      await sendEmail("katadekoreseskuvoszervezes@gmail.com", "Rendelés érkezett", "Egy újabb felhasználó leadta a rendelést!",);
      await sendEmail([decodedToken.email, userData.email], "A rendelését sikeresen leadta!",
        "A rendelés feldolgozás alatt van, hamarosan fel vesszük a kapcsolatot Önnel!",);
    } catch (err) {
      console.error("Hiba történt az értesítés küldésekor:", err);
      return res
        .status(500)
        .json({ error: "Nem sikerült az értesítést elküldeni." });
    }

    res.status(201).json({ message: "Sikeres rendelés!", items: orderIds });
  } catch (err) {
    if (err.message.includes("Invalid")) {
      res.status(400).json({
        error: err.message,
      });
      return;
    }
    console.error("Rendelés mentési hiba:", err);
    res.status(500).json({ error: "Nem sikerült menteni a rendelést!" });
  }
});

apiRouter.get("/profile", async (req, res) => {

  try {
    const authHeader = req.headers["authorization"];
    console.log("Authorization header:", authHeader); 

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Hiányzó vagy hibás autentikációs fejléc"); 
      return res.status(401).json({ error: "🔒 Hiányzó vagy hibás autentikációs fejléc!" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token); 

    if (!token) {
      console.log("Hiányzó token"); 
      return res.status(401).json({ error: "🔒 Hiányzó token!" });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || "secret");
      console.log("Dekódolt token:", decodedToken); 
    } catch (err) {
      console.log("Érvénytelen vagy lejárt token:", err); 
      return res.status(401).json({ error: "❌ Érvénytelen vagy lejárt token!" });
    }

    const [users] = await pool.query("SELECT first_name, last_name, email FROM user WHERE user_id = ?", [
      decodedToken.userId,
    ]);

    if (users.length === 0) {
      console.log("Felhasználó nem található"); s
      return res.status(404).json({ error: "❌ Felhasználó nem található!" });
    }

    const user = users[0];
    console.log("Felhasználói adatok:", user); 

    res.json({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    });
    console.log("Válasz elküldve"); 
  } catch (err) {
    console.error("Profil lekérdezési hiba:", err);
    res.status(500).json({ error: "❌ Nem sikerült lekérni a felhasználói profilt!" });
  }
});

export default apiRouter;
