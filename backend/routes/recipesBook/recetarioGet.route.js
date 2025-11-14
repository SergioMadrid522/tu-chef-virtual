/* libraries */
import express from "express";
/* db connection */
import { pool } from "../../db.js";
const router = express.Router();

/*------------------------------------ Recetario GET ------------------------------------*/
router.get("/", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "Falta el ID del usuario." });
  }

  try {
    const rows = await pool.query(
      `SELECT 
          intIdReceta, 
          strTitulo, 
          txtDescripcion, 
          intKcal, 
          jsonIngredientes, 
          jsonInstrucciones
       FROM tblRecetario 
       WHERE intIdUser = $1
       ORDER BY intIdReceta DESC`,
      [userId]
    );

    // Convertimos los campos JSON que vienen como string
    const parsedRows = rows.rows.map((r) => ({
      intIdReceta: r.intidreceta,
      strTitulo: r.strtitulo,
      txtDescripcion: r.txtdescripcion,
      intKcal: r.intkcal,

      jsonIngredientes:
        typeof r.jsoningredientes === "string"
          ? JSON.parse(r.jsoningredientes)
          : r.jsoningredientes,

      jsonInstrucciones:
        typeof r.jsoninstrucciones === "string"
          ? JSON.parse(r.jsoninstrucciones)
          : r.jsoninstrucciones,
    }));

    res.json(parsedRows);
  } catch (error) {
    console.error("Error en /recetario/get:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
