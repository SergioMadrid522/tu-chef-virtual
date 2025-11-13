// 1. IMPORTACIONES
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise"); // Usamos mysql2 con promesas (async/await)
const bcrypt = require("bcryptjs"); // Para hashear contraseñas
const jwt = require("jsonwebtoken"); // Para crear tokens de sesión

require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 3111;

const JWT_SECRET = "esta-es-una-clave-secreta-temporal-para-tu-chef";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// (Tu dbConfig no cambia)
const dbConfig = {
  host: "127.0.0.1",
  user: "root",
  password: "root",
  database: "TuChefInteligente",
  port: 3306,
};

// (Tus middlewares no cambian)
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`\n[AuthServer] ${req.method} en ${req.originalUrl}`);
  next();
});

app.post("/register", async (req, res) => {
  const { strUser, strEmail, password } = req.body;
  let connection;

  if (!strUser || !strEmail || !password) {
    return res.status(400).json({
      error: "Faltan campos (strUser, strEmail, password son requeridos).",
    });
  }

  try {
    connection = await mysql.createConnection(dbConfig);

    const [existing] = await connection.execute(
      "SELECT * FROM tblUsers WHERE strUser = ? OR strEmail = ?",
      [strUser, strEmail]
    );

    if (existing.length > 0) {
      return res
        .status(401)
        .json({ error: "El nombre de usuario o email ya están registrados." });
    }

    const salt = await bcrypt.genSalt(10);
    const strPasswordHash = await bcrypt.hash(password, salt);

    await connection.execute(
      "INSERT INTO tblUsers (strUser, strEmail, strPasswordHash) VALUES (?, ?, ?)",
      [strUser, strEmail, strPasswordHash]
    );

    await connection.end();
    res.status(201).json({ message: "¡Usuario registrado con éxito!" });
  } catch (error) {
    console.error("Error en /register:", error);
    if (connection) await connection.end();
    res.status(500).json({ error: "Error interno del servidor al registrar." });
  }
});

app.post("/login", async (req, res) => {
  const { strUser, password } = req.body;
  let connection;
  if (!strUser || !password) {
    return res
      .status(400)
      .json({ error: "Faltan campos (strUser, password son requeridos)." });
  }
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT * FROM tblUsers WHERE strUser = ?",
      [strUser]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    const isMatch = await bcrypt.compare(password, user.strPasswordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    await connection.end();
    const payload = {
      user: {
        id: user.intIdUser,
        username: user.strUser,
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
    console.error("Error en /login:", error);
    if (connection) await connection.end();
    res
      .status(500)
      .json({ error: "Error interno del servidor al iniciar sesión." });
  }
});

app.get("/getMenu", async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const queryText = `
          SELECT 
            intIdRow, 
            strName, 
            booleanVisible,
            strArchive 
          FROM menu 
          WHERE booleanVisible = 1 
          ORDER BY intIdRow;
        `;

    const [rows] = await connection.execute(queryText);
    console.log(
      `[AuthServer] Enviando ${rows.length} items del menú al cliente.`
    );

    res.json(rows);
  } catch (error) {
    console.error("Error en /getMenu:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al obtener el menú." });
  } finally {
    if (connection) {
      await connection.end();
      console.log("[AuthServer] Conexión a DB cerrada.");
    }
  }
});

app.get("/preferences/get", async (req, res) => {
  const { userId } = req.query;
  let connection;

  if (!userId) {
    return res.status(400).json({ error: "Falta el ID del usuario." });
  }

  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT jsonPreferences FROM tblPerfilCulinario WHERE intIdUser = ?",
      [userId]
    );

    if (rows.length > 0 && rows[0].jsonPreferences) {
      const rawData = rows[0].jsonPreferences;
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
  } finally {
    if (connection) await connection.end();
  }
});

app.post("/preferences/save", async (req, res) => {
  const { userId, preferences } = req.body;
  let connection;

  if (!userId || !preferences) {
    return res
      .status(400)
      .json({ error: "Faltan datos (userId, preferences)." });
  }

  try {
    connection = await mysql.createConnection(dbConfig);
    const prefsString = JSON.stringify(preferences);
    const query = `
            INSERT INTO tblPerfilCulinario (intIdUser, jsonPreferences)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE
                jsonPreferences = ?;
        `;

    await connection.execute(query, [userId, prefsString, prefsString]);
    res.status(200).json({ message: "Preferencias guardadas con éxito." });
  } catch (error) {
    console.error("Error en /preferences/save:", error);
    res.status(500).json({ error: "Error interno del servidor al guardar." });
  } finally {
    if (connection) await connection.end();
  }
});

app.get("/allergies/get", async (req, res) => {
  const { userId } = req.query;
  let connection;

  if (!userId) {
    return res.status(400).json({ error: "Falta el ID del usuario." });
  }

  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT jsonAllergies FROM tblPerfilCulinario WHERE intIdUser = ?",
      [userId]
    );

    if (rows.length > 0 && rows[0].jsonAllergies) {
      const rawData = rows[0].jsonAllergies;
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
  } finally {
    if (connection) await connection.end();
  }
});

app.post("/allergies/save", async (req, res) => {
  const { userId, allergies } = req.body;
  let connection;

  if (!userId || !allergies) {
    return res.status(400).json({ error: "Faltan datos (userId, allergies)." });
  }

  try {
    connection = await mysql.createConnection(dbConfig);
    const allergiesString = JSON.stringify(allergies);
    const query = `
            INSERT INTO tblPerfilCulinario (intIdUser, jsonAllergies)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE
                jsonAllergies = ?;
        `;
    await connection.execute(query, [userId, allergiesString, allergiesString]);
    res.status(200).json({ message: "Alergias guardadas con éxito." });
  } catch (error) {
    console.error("Error en /allergies/save:", error);
    res.status(500).json({ error: "Error interno del servidor al guardar." });
  } finally {
    if (connection) await connection.end();
  }
});

app.get("/recetario/get", async (req, res) => {
  const { userId } = req.query;
  let connection;

  if (!userId) {
    return res.status(400).json({ error: "Falta el ID del usuario." });
  }

  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      `SELECT 
          intIdReceta, 
          strTitulo, 
          txtDescripcion, 
          intKcal, 
          jsonIngredientes, 
          jsonInstrucciones
       FROM tblRecetario 
       WHERE intIdUser = ?
       ORDER BY intIdReceta DESC`,
      [userId]
    );

    // Convertimos los campos JSON que vienen como string
    const parsedRows = rows.map((r) => ({
      ...r,
      jsonIngredientes:
        typeof r.jsonIngredientes === "string"
          ? JSON.parse(r.jsonIngredientes)
          : r.jsonIngredientes,
      jsonInstrucciones:
        typeof r.jsonInstrucciones === "string"
          ? JSON.parse(r.jsonInstrucciones)
          : r.jsonInstrucciones,
    }));

    res.json(parsedRows);
  } catch (error) {
    console.error("Error en /recetario/get:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  } finally {
    if (connection) await connection.end();
  }
});
app.post("/recetario/save", async (req, res) => {
  const { userId, titulo, descripcion, kcal, ingredientes, instrucciones } =
    req.body;
  let connection;

  if (!userId || !titulo) {
    return res.status(400).json({ error: "Faltan datos requeridos." });
  }

  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      `INSERT INTO tblRecetario 
        (intIdUser, strTitulo, txtDescripcion, intKcal, jsonIngredientes, jsonInstrucciones)
       VALUES (?, ?, ?, ?, ?, ?)`,
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
  } finally {
    if (connection) await connection.end();
  }
});

app.post("/chat", async (req, res) => {
  const { userId, message, history } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: "Faltan datos (userId, message)." });
  }

  let connection;
  try {
    // PASO 1: Obtener el contexto del usuario
    connection = await mysql.createConnection(dbConfig);
    const [profileRows] = await connection.execute(
      "SELECT jsonPreferences, jsonAllergies FROM tblPerfilCulinario WHERE intIdUser = ?",
      [userId]
    );

    let userProfile = { preferences: {}, allergies: [] };

    if (profileRows.length > 0) {
      userProfile.preferences =
        typeof profileRows[0].jsonPreferences === "string"
          ? JSON.parse(profileRows[0].jsonPreferences)
          : profileRows[0].jsonPreferences || {};

      userProfile.allergies =
        typeof profileRows[0].jsonAllergies === "string"
          ? JSON.parse(profileRows[0].jsonAllergies)
          : profileRows[0].jsonAllergies || [];
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
  } finally {
    if (connection) await connection.end();
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor de Autenticación corriendo en http://0.0.0.0:${PORT}`);
  console.log(`Rutas disponibles:`);
  console.log(`  POST /register`);
  console.log(`  POST /login`);
  console.log(`  GET  /getMenu`);
  console.log(`  POST  /chat`);

  console.log(`  GET  /preferences/get`);
  console.log(`  POST /preferences/save`);
  console.log(`  GET  /allergies/get`);
  console.log(`  POST /allergies/save`);
});
