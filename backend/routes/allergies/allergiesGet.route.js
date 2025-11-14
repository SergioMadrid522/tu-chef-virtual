/* libraries */
import express from "express";
/* db connection */
import { pool } from "../../db.js";
const router = express.Router();

/*------------------------------------ Allergies GET ------------------------------------*/
router.get("/", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Falta el ID del usuario." });
  }

  try {
    const rows = await pool.query(
      "SELECT jsonAllergies FROM tblPerfilCulinario WHERE intIdUser = $1",
      [userId]
    );

    if (rows.rows.length > 0 && rows.rows[0].jsonallergies) {
      const rawData = rows.rows[0].jsonallergies;
      let allergiesArray = [];

      try {
        // Si ya es un objeto/array o JSON válido
        allergiesArray =
          typeof rawData === "string" ? JSON.parse(rawData) : rawData;
      } catch (e) {
        console.warn("⚠️ No era JSON válido, convirtiendo manualmente...");
        // Si es texto tipo "mani,nueces", lo convertimos
        allergiesArray = rawData.split(",").map((a) => a.trim());
      }

      res.json(allergiesArray || []);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("Error en /allergies/get:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
