/* libraries */
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
/* bd connection */
import { pool } from "../../db.js";

const router = express.Router();
/*------------------------------------ Login ------------------------------------*/
const JWT_SECRET = "esta-es-una-clave-secreta-temporal-para-tu-chef";
router.post("/", async (req, res) => {
  const { strUser, password } = req.body;
  if (!strUser || !password) {
    return res
      .status(400)
      .json({ error: "Faltan campos (strUser, password son requeridos)." });
  }
  try {
    const rows = await pool.query("SELECT * FROM tblUsers WHERE strUser = $1", [
      strUser,
    ]);

    const user = rows.rows[0];
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    const isMatch = await bcrypt.compare(password, user.strpasswordhash);
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    const payload = {
      user: {
        id: user.intiduser,
        username: user.struser,
      },
    };

    /* Create token and last 1 hour*/
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
    res.json({
      message: "Login exitoso",
      token: token,
      user: payload.user,
    });
  } catch (error) {
    console.error("Error en /auth/login:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al iniciar sesión." });
  }
});

export default router;
