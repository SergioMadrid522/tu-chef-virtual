// src/Routes.js

// La URL base de tu servidor de autenticación
const URL = "https://tu-chef-virtual.onrender.com/api/";

const ROUTES = {
  PREFERENCES: {
    GET: "preferences/get",
    SAVE: "preferences/save",
  },
  ALLERGIES: {
    GET: "allergies/get",
    SAVE: "allergies/save",
  },
  RECETARIO: {
    GET: "recetario/get",
    SAVE: "recetario/save",
  },

  MENU: "getMenu",
  LOGIN: "auth/login",
  REGISTER: "auth/register",
  CHAT: "chat",
};

export { URL, ROUTES };
