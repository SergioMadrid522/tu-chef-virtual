/* libraries */
import express from "express";
/* db connection */
import { pool } from "../../db.js";

const router = express.Router();

/*------------------------------------ Preferences POST ------------------------------------*/
router.post("/", async (req, res) => {
  const { userId, preferences } = req.body;

  if (!userId || !preferences) {
    return res
      .status(400)
      .json({ error: "Faltan datos (userId, preferences)." });
  }

  try {
    const prefsString = JSON.stringify(preferences);

    const query = `
      INSERT INTO tblPerfilCulinario (intIdUser, jsonPreferences)
      VALUES ($1, $2)
      ON CONFLICT (intIdUser)
      DO UPDATE SET jsonPreferences = $2, dtUpdated = CURRENT_TIMESTAMP;
    `;

    await pool.query(query, [userId, prefsString]);

    res.status(200).json({ message: "Preferencias guardadas con éxito." });
  } catch (error) {
    console.error("Error en /preferences/save:", error);
    res.status(500).json({ error: "Error interno del servidor al guardar." });
  }
});

export default router;
