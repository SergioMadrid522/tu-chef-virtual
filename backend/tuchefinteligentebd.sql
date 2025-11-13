CREATE DATABASE TuChefInteligente;
USE TuChefInteligente;

-- TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS tblUsers (
  intIdUser INT AUTO_INCREMENT PRIMARY KEY,
  strUser VARCHAR(100) NOT NULL UNIQUE,
  strEmail VARCHAR(150) NOT NULL UNIQUE,
  strPasswordHash VARCHAR(255) NOT NULL,
  dtCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA DE PERFIL CULINARIO
CREATE TABLE IF NOT EXISTS tblPerfilCulinario (
  intIdPerfil INT AUTO_INCREMENT PRIMARY KEY,
  intIdUser INT NOT NULL,
  jsonPreferences JSON DEFAULT NULL,
  jsonAllergies JSON DEFAULT NULL,
  dtUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (intIdUser),
  FOREIGN KEY (intIdUser) REFERENCES tblUsers(intIdUser) ON DELETE CASCADE
);

-- TABLA DE RECETARIO (Recetas guardadas)
CREATE TABLE IF NOT EXISTS tblRecetario (
  intIdReceta INT AUTO_INCREMENT PRIMARY KEY,
  intIdUser INT NOT NULL,
  strTitulo VARCHAR(255) NOT NULL,
  txtDescripcion TEXT,
  intKcal INT DEFAULT NULL,
  jsonIngredientes JSON DEFAULT NULL,
  jsonInstrucciones JSON DEFAULT NULL,
  dtGuardado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (intIdUser) REFERENCES tblUsers(intIdUser) ON DELETE CASCADE
);

-- TABLA DE MENÚ
CREATE TABLE IF NOT EXISTS menu (
  intIdRow INT AUTO_INCREMENT PRIMARY KEY,
  strName VARCHAR(100) NOT NULL,
  booleanVisible BOOLEAN DEFAULT TRUE,
  strArchive VARCHAR(255) DEFAULT NULL
);

-- OPCIONES DEL MENU
INSERT INTO menu (strName, booleanVisible, strArchive) VALUES
('Inicio', 1, 'inicio'),
('Asistente IA', 1, 'asistente'),
('Mi Recetario', 1, 'recetario'),
('Monitor de Calorías', 1, 'calorias'),
('Mis Preferencias', 1, 'preferencias'),
('Gestión de Alergias', 1, 'alergias');
