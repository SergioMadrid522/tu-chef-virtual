/* libraries */
import express from "express";
import bcrypt from "bcryptjs";
/* bd connection */
import { pool } from "../../db.js";
const router = express.Router();

/*------------------------------------ Register ------------------------------------*/
router.post("/", async (req, res) => {
  const { strUser, strEmail, password } = req.body;

  if (!strUser || !strEmail || !password) {
    return res.status(400).json({
      error: "Faltan campos (strUser, strEmail, password son requeridos).",
    });
  }

  try {
    const existing = await pool.query(
      "SELECT * FROM tblUsers WHERE strUser = $1 OR strEmail = $2",
      [strUser, strEmail]
    );

    if (existing.rows.length > 0) {
      return res
        .status(401)
        .json({ error: "El nombre de usuario o email ya están registrados." });
    }

    const salt = await bcrypt.genSalt(10);
    const strPasswordHash = await bcrypt.hash(password, salt);

    await pool.query(
      "INSERT INTO tblUsers (strUser, strEmail, strPasswordHash) VALUES ($1, $2, $3)",
      [strUser, strEmail, strPasswordHash]
    );

    res.status(201).json({ message: "¡Usuario registrado con éxito!" });
  } catch (error) {
    console.error("Error en /register:", error);
    res.status(500).json({ error: "Error interno del servidor al registrar." });
  }
});

export default router;
