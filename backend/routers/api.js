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

// Segédfüggvények

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

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "🔒 Hiányzó vagy hibás autentikációs fejléc!" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "🔒 Hiányzó token!" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decodedToken;
    next();
  } catch (err) {
    console.log("Hitelesítési hiba:", err);
    return res.status(401).json({ error: "❌ Érvénytelen vagy lejárt token!" });
  }
};


apiRouter.post("/quote_request", async (req, res) => {
  try {
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
      await sendEmail(process.env.ADMIN_EMAIL, emailSubject, emailText);
      await sendEmail(email, "Ajánlatkérését megkaptuk", "Köszönjük ajánlatkérését! Hamarosan felvesszük Önnel a kapcsolatot.");
    } catch (err) {
      console.error("Hiba történt az értesítés küldésekor:", err);
      return res.status(500).json({ error: "Nem sikerült az értesítést elküldeni." });
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

// Felhasználó kezelés

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
    } else if (body.action === "login") {
      const [users] = await pool.query("SELECT * FROM user WHERE email = ?", [body.email]);

      if (users.length === 0) {
        return res.status(400).json({ error: "❌ Hibás e-mail vagy jelszó!" });
      }

      const user = users[0];
      const isPasswordValid = await bcrypt.compare(body.password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ error: "❌ Hibás e-mail vagy jelszó!" });
      }

      const token = jwt.sign(
        { 
          userId: user.user_id, 
          email: user.email, 
          phone: user.phone_number
        },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "2h" }
      );

      res.json({
        message: `✅ Sikeres bejelentkezés, ${user.first_name}!`,
        token
      });
    } else {
      return res.status(400).json({ error: "Érvénytelen művelet!" });
    }
  } catch (err) {
    if (err.message.includes("Invalid")) {
      res.status(400).json({
        error: err.message,
      });
      return;
    }
    console.error("Hiba a felhasználó kezelése közben:", err);
    res.status(500).json({
      error: "Szerverhiba történt a felhasználó kezelése közben",
    });
  }
});

apiRouter.get("/profile", authenticateUser, async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT user_id, first_name, last_name, email, phone_number FROM user WHERE user_id = ?", 
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "❌ Felhasználó nem található!" });
    }

    const user = users[0];
    res.json({
      userId: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number
    });
  } catch (err) {
    console.error("Profil lekérdezési hiba:", err);
    res.status(500).json({ error: "❌ Nem sikerült lekérni a felhasználói profilt!" });
  }
});

// Termékek kezelése (csak bejelentkezett felhasználóknak)

apiRouter.get("/rentable_products", async (req, res) => {
  try {
    const [products] = await pool.query("SELECT * FROM rentable_products");
    res.status(200).json(products);
  } catch (err) {
    console.error("Hiba a termékek lekérdezése közben:", err);
    res.status(500).json({ error: "Nem sikerült lekérdezni a termékeket" });
  }
});

// Rendelések kezelése

apiRouter.post("/order", authenticateUser, async (req, res) => {
  try {
    const { cart, userData } = req.body;

    if (!Array.isArray(cart) || cart.length === 0 || !userData) {
      return res.status(400).json({ error: "Hiányzó vagy érvénytelen rendelési adatok!" });
    }

    if (!userData.city || typeof userData.city !== "string") {
      throw new Error("Invalid 'city' field");
    }
    if (!userData.street || typeof userData.street !== "string") {
      throw new Error("Invalid 'street' field");
    }
    if (!userData.zip || typeof userData.zip !== "number") {
      throw new Error("Invalid 'zip' field");
    }
    if (!userData.phone || typeof userData.phone !== "string") {
      throw new Error("Invalid 'phone' field");
    }

    const orderDate = new Date();
    const orderIds = [];

    // Tranzakció kezdése
    await pool.query("START TRANSACTION");

    try {
      for (const item of cart) {
        // Ellenőrizzük, hogy létezik-e a termék
        const [products] = await pool.query(
          "SELECT * FROM rentable_products WHERE rentable_product_id = ?",
          [item.productId]
        );
        
        if (products.length === 0) {
          throw new Error(`Nem található termék a következő ID-val: ${item.productId}`);
        }

        const [orderResult] = await pool.query(
          "INSERT INTO orders (user_id, rentable_id, phone_number, city, street, zip, order_date) VALUES (?, ?, ?, ?, ?, ?, ?);",
          [req.user.userId, item.productId, userData.phone, userData.city, userData.street, userData.zip, orderDate]
        );
        orderIds.push(orderResult.insertId);
      }

      // Tranzakció commit
      await pool.query("COMMIT");

      // Email küldése
      try {
        const adminEmailText = `Új rendelés érkezett a következő felhasználótól: ${req.user.email}\nRendelés azonosítók: ${orderIds.join(", ")}`;
        await sendEmail(process.env.ADMIN_EMAIL, "Új rendelés érkezett", adminEmailText);
        
        const userEmailText = `Köszönjük rendelését!\nRendelése azonosítói: ${orderIds.join(", ")}\nA rendelés állapota: Feldolgozás alatt`;
        await sendEmail(req.user.email, "Rendelését megkaptuk", userEmailText);
      } catch (emailErr) {
        console.error("Hiba az email küldésekor:", emailErr);
      }

      res.status(201).json({ 
        message: "Sikeres rendelés!", 
        orderIds,
        count: orderIds.length
      });
    } catch (err) {
      // Tranzakció visszagörgetése hiba esetén
      await pool.query("ROLLBACK");
      throw err;
    }
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

export default apiRouter;