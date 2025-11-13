# Tu-Chef-Virtual (AI Recipe Assistant)

<p align="center">
  <strong>A full-stack web application that acts as a personal AI recipe assistant, built by a team of software engineers.</strong>
  <br />
  This app uses the Google AI (Gemini) API to generate custom recipes based on a user's preferences, allergies, and available ingredients. It features a secure backend with JWT authentication and a relational database to manage user profiles.
</p>

---

## Tech Stack

* **Frontend:** React, React-Bootstrap
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL (Deployed on NEON)
* **Authentication:** JSON Web Tokens (JWT) & bcrypt.js
* **AI:** Google (Gemini) AI API

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

* Node.js (v18 or newer)
* PostgreSQL
* A Google AI (Gemini) API Key

### 1. Clone the Repository

```bash
git clone [https://URL-DE-TU-REPO.git](https://URL-DE-TU-REPO.git)
cd tu-chef-virtual
```

### 2. Backend Setup

The backend server provides the RESTful API and handles authentication.

```bash
# Navigate to the backend folder
cd backend

# Install all required dependencies
npm install
```

Create the .env file Create a .env file in the /backend root and add the following environment variables. This project uses JWT for authentication and MySQL for the database.

```bash
# Google AI API Key
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Run the Backend Server

```bash
# This will start the server, typically on http://localhost:8080
npm run dev
```

### 3. Frontend Setup
The frontend is a React application that consumes the backend API.

```bash
# Open a new terminal.
# Navigate to the frontend folder from the root directory.
cd frontend

# Install all required dependencies
npm install
```

Run the Frontend CLient

```bash
# This will start the React dev server and open a browser window
npm start
```

You should now have the application running locally!

---

## Contributors
1. D4nD4n01
2. SergioMadrid522
