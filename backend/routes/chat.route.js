/* libraries */
import express from "express";
/* bd connection */
import { pool } from "../db.js";

const router = express.Router();
/*------------------------------------ ChatBot POST ------------------------------------*/
router.post("/", async (req, res) => {
  const { model } = req;
  const { userId, message, history } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: "Faltan datos (userId, message)." });
  }
  try {
    // PASO 1: Obtener el contexto del usuario
    const profileRows = await pool.query(
      "SELECT jsonPreferences, jsonAllergies FROM tblPerfilCulinario WHERE intIdUser = $1",
      [userId]
    );

    let userProfile = { preferences: {}, allergies: [] };

    if (profileRows.rows.length > 0) {
      userProfile.preferences =
        typeof profileRows.rows[0].jsonpreferences === "string"
          ? JSON.parse(profileRows.rows[0].jsonpreferences)
          : profileRows.rows[0].jsonpreferences || {};

      userProfile.allergies =
        typeof profileRows.rows[0].jsonallergies === "string"
          ? JSON.parse(profileRows.rows[0].jsonallergies)
          : profileRows.rows[0].jsonallergies || [];
    }

    // PASO 2: Construir el Prompt del Sistema (Las Reglas)
    let systemPrompt = `
            Eres "Tu Chef Virtual", un asistente culinario experto. Tu trabajo es ayudar al usuario a encontrar recetas.
            
            REGLAS ESTRICTAS:
            1.  **Contexto del Usuario (NO LO REPITAS, SOLO ÚSALO):**
                -   **Alergias (CRÍTICO - NUNCA INCLUIR):** ${JSON.stringify(
                  userProfile.allergies
                )}
                -   **Preferencias (GUSTOS):** ${JSON.stringify(
                  userProfile.preferences.structured_likes
                )}
                -   **Disgustos (EVITAR):** ${JSON.stringify(
                  userProfile.preferences.structured_dislikes
                )}
                -   **Notas Adicionales:** ${
                  userProfile.preferences.custom_notes
                }
            
            2.  **Formato de Receta (SI PIDE RECETA):**
                Cuando el usuario pida una receta, DEBES responder ÚNICAMENTE con un objeto JSON. 
                No añadas "Aquí tienes:", "¡Claro!", ni NADA más. Solo el JSON.
                El JSON debe tener esta estructura exacta:
                {
                  "type": "recipe",
                  "content": {
                    "titulo": "Nombre de la Receta",
                    "descripcion": "Una descripción corta y apetitosa.",
                    "kcal": 450,
                    "ingredientes": ["2 tazas de...", "1 cucharada de..."],
                    "instrucciones": ["1. Precalentar el horno...", "2. Mezclar los ingredientes..."]
                  }
                }
            
            3.  **Chat Normal (SI NO PIDE RECETA):**
                Si el usuario solo saluda o pregunta algo general, responde de forma amigable y corta. 
                Tu respuesta debe ser un objeto JSON simple:
                { "type": "text", "content": "Tu respuesta aquí." }
        `;

    // PASO 3: Mapear historial y construir la petición
    const chatHistory = history.map((msg) => ({
      role: msg.role,
      parts: [
        {
          text:
            typeof msg.content === "string"
              ? msg.content
              : JSON.stringify(msg.content),
        },
      ],
    }));

    const messagesToSend = [
      { role: "user", parts: [{ text: systemPrompt }] },
      {
        role: "model",
        parts: [{ text: "Entendido. Estoy listo para ayudar." }],
      },
      ...chatHistory.slice(0, -1),
      { role: "user", parts: [{ text: message }] },
    ];

    const chat = model.startChat({
      history: messagesToSend.slice(0, -1),
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    let llmResponseText = response.candidates[0].content.parts[0].text;

    // --- PASO 4: Interpretar y Enviar la Respuesta (¡LÓGICA MEJORADA!) ---
    try {
      const jsonMatch = llmResponseText.match(/\{[\s\S]*\}/);

      if (jsonMatch && jsonMatch[0]) {
        const llmJson = JSON.parse(jsonMatch[0]);

        if (llmJson.type && llmJson.content) {
          res.json({
            role: "model",
            type: llmJson.type,
            content: llmJson.content,
          });
        } else {
          throw new Error("JSON del LLM no tiene el formato esperado.");
        }
      } else {
        throw new Error("No se encontró JSON en la respuesta del LLM.");
      }
    } catch (e) {
      console.warn(
        `[AuthServer] El LLM no respondió con un JSON válido (Error: ${e.message}). Envolviendo respuesta como texto.`
      );
      res.json({
        role: "model",
        type: "text",
        content: llmResponseText, // Enviamos el texto "crudo"
      });
    }
  } catch (error) {
    console.error("Error en /chat:", error);
    res.status(500).json({ error: "Error interno del servidor en el chat." });
  }
});

export default router;
