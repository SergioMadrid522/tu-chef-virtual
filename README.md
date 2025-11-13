# Como ejecutar el proyecto?

Tendrás dos carpetas (Frontend, Backend)

## Frontend

1. Si marca error de dependencias ejecuta el siguiente comando:

   ```bash
   npm install @testing-library/dom @testing-library/jest-dom @testing-library/react @testing-library/user-event bootstrap react react-bootstrap react-bootstrap-icons react-dom react-router-bootstrap react-router-dom react-scripts sweetalert2 web-vitals
   ```

2. Ahora solo ejecuta:

   ```bash
   npm start
   ```

   una vez que ejecutes este comando, se abrirá el navegador automaticamente.

## Backend

1. Instala las siguientes dependencias:

   ```bash
   npm install @google/generative-ai bcryptjs cors dotenv express jsonwebtoken mysql2 nodemon
   ```

2. Antes de ejecutar el servidor, crea un archivo .env donde guardarás esto:
   ```bash
    GEMINI_API_KEY=<Inserta_tu_api_key_aqui>
   ```
3. Para la base de datos copia el script que esta en la carpeta _backend_ y pegalo en tu gestor de base de datos favorito
