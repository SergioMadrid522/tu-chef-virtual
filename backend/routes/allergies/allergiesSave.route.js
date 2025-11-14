/* libraries */
import express from "express";
/* db connection */
import { pool } from "../../db.js";

const router = express.Router();
/*------------------------------------ Allergies POST ------------------------------------*/
router.post("/", async (req, res) => {
  const { userId, allergies } = req.body;
  if (!userId || !allergies) {
    return res.status(400).json({ error: "Faltan datos (userId, allergies)." });
  }

  try {
    const allergiesString = JSON.stringify(allergies);
    const query = `
      INSERT INTO tblPerfilCulinario (intIdUser, jsonAllergies)
      VALUES ($1, $2)
      ON CONFLICT (intIdUser) 
      DO UPDATE SET jsonAllergies = $2, dtUpdated = CURRENT_TIMESTAMP;
    `;
    await pool.query(query, [userId, allergiesString]);
    res.status(200).json({ message: "Alergias guardadas con éxito." });
  } catch (error) {
    console.error("Error en /allergies/save:", error);
    res.status(500).json({ error: "Error interno del servidor al guardar." });
  }
});

export default router;
