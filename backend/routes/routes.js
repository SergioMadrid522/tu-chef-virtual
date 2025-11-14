/* libraries*/
import express from "express";
/* routes */
import loginRoute from "./auth/login.route.js";
import registerRoute from "./auth/register.route.js";
import prefSaveRoute from "./preferences/prefSave.route.js";
import prefGetRoute from "./preferences/prefGet.route.js";
import allergiesGetRoute from "./allergies/allergiesGet.route.js";
import allergiesSaveRoute from "./allergies/allergiesSave.route.js";
import recetarioSave from "./recipesBook/recetarioSave.route.js";
import recetarioGet from "./recipesBook/recetarioGet.route.js";
import menu from "./menu.route.js";
import chat from "./chat.route.js";

const routes = express.Router();

/* admin routes*/
routes.use("/auth/login", loginRoute);
routes.use("/auth/register", registerRoute);
/* preferences routes*/
routes.use("/preferences/save", prefSaveRoute);
routes.use("/preferences/get", prefGetRoute);
/* allergies routes*/
routes.use("/allergies/get", allergiesGetRoute);
routes.use("/allergies/save", allergiesSaveRoute);
/* recipeBook */
routes.use("/recetario/save", recetarioSave);
routes.use("/recetario/get", recetarioGet);
/* menu */
routes.use("/getMenu", menu);
/* chatbot */
routes.use("/chat", chat);
export default routes;
