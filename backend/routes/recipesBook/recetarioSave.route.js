/* libraries */
import express from "express";
/* db connection */
import { pool } from "../../db.js";
const router = express.Router();
/*------------------------------------ Recetario POST ------------------------------------*/
router.post("/", async (req, res) => {
  const { userId, titulo, descripcion, kcal, ingredientes, instrucciones } =
    req.body;

  if (!userId || !titulo) {
    return res.status(400).json({ error: "Faltan datos requeridos." });
  }

  try {
    await pool.query(
      `INSERT INTO tblRecetario 
        (intIdUser, strTitulo, txtDescripcion, intKcal, jsonIngredientes, jsonInstrucciones)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        titulo,
        descripcion || "",
        kcal || null,
        JSON.stringify(ingredientes || []),
        JSON.stringify(instrucciones || []),
      ]
    );

    res.status(201).json({ message: "Receta guardada con éxito." });
  } catch (error) {
    console.error("Error en /recetario/save:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al guardar receta." });
  }
});

export default router;
