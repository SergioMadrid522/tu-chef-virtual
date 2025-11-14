/* libraries */
import express from "express";
/* db connection */
import { pool } from "../../db.js";
const router = express.Router();

/*------------------------------------ Preferences GET ------------------------------------*/
router.get("/", async (req, res) => {
  const userIdRaw = req.query.userId;
  const userId = parseInt(userIdRaw, 10); // Parse as integer

  // Validate: must be a valid positive integer
  if (isNaN(userId) || userId <= 0) {
    return res
      .status(400)
      .json({ error: "ID de usuario inválido o faltante." });
  }

  try {
    const rows = await pool.query(
      "SELECT jsonPreferences FROM tblPerfilCulinario WHERE intIdUser = $1",
      [userId] // Now a proper integer
    );

    if (rows.rows.length > 0 && rows.rows[0].jsonpreferences) {
      const rawData = rows.rows[0].jsonpreferences;
      let preferencesObject;

      try {
        preferencesObject =
          typeof rawData === "string" ? JSON.parse(rawData) : rawData;
      } catch (e) {
        console.error("Error al parsear JSON:", e);
        preferencesObject = {};
      }

      res.json(preferencesObject || {});
    } else {
      res.json({});
    }
  } catch (error) {
    console.error("Error en /preferences/get:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
