import express from "express";
/* bd connection */
import { pool } from "../db.js";
const router = express.Router();
/*------------------------------------ Menu GET ------------------------------------*/
router.get("/", async (req, res) => {
  try {
    const queryText = `
      SELECT 
        intIdRow AS "intIdRow",
        strName AS "strName",
        booleanVisible AS "booleanVisible",
        strArchive AS "strArchive"
      FROM menu 
      WHERE booleanVisible = TRUE
      ORDER BY intIdRow;
    `;

    const rows = await pool.query(queryText);
    console.log(
      `[AuthServer] Enviando ${rows.rows.length} items del menú al cliente.`
    );

    res.json(rows.rows);
  } catch (error) {
    console.error("Error en /getMenu:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al obtener el menú." });
  }
});
export default router;
