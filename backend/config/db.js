import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();
//ellenőrzi, hogy minden környezeti változó meg van-e adva
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME || !process.env.JWT_SECRET) {
    throw new Error("Hiányzó környezeti változók! Ellenőrizd a .env fájlt.");
}

// Adatbázis kapcsolat
export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
});

// Titkos kulcs exportálása
export const jwtSecret = process.env.JWT_SECRET;
