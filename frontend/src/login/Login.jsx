import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { successAlert, errorAlert } from "../SweetAlert/Alerts.js";
// Importamos los componentes de React-Bootstrap
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import "./AuthBackground.css";
import { URL, ROUTES } from "../Routes";

function Login() {
  const [strUser, setStrUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // (Este hook para verificar sesión existente no cambia)
  useEffect(() => {
    const userId = localStorage.getItem("IdUser");
    if (userId) {
      navigate("/app");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!strUser || !password) {
      setError("Por favor, ingresa usuario y contraseña.");
      errorAlert(error);
      return;
    }

    try {
      const response = await fetch(URL + ROUTES.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strUser, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userId = data.user.id;
        localStorage.setItem("IdUser", userId);

        successAlert(
          "¡Inicio de sesión exitoso!",
          "En un momento será redirigido..."
        );
        setTimeout(() => {
          navigate("/app");
        }, 1000);
      } else {
        setError(data.error || "Credenciales inválidas.");
        errorAlert(data.error);
      }
    } catch (error) {
      console.error("Error de red al intentar iniciar sesión:", error);
      setError("No se pudo conectar con el servidor.");
      errorAlert(error);
    }
  };

  const goToRegister = () => {
    navigate("/register");
  };

  return (
    <div className="auth-background">
      {/* Este contenedor es para que React-Bootstrap no choque con el z-index */}
      <Container className="auth-content">
        <Row className="justify-content-center">
          {" "}
          {/* Centramos la Row */}
          <Col md={8} lg={6} xl={5}>
            {" "}
            {/* Controlamos el ancho de la tarjeta */}
            <Card style={{ width: "100%" }} className="shadow-sm">
              {" "}
              {/* Quitamos el '25rem' */}
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <span
                    style={{ fontSize: "3rem" }}
                    role="img"
                    aria-label="chef"
                  >
                    👨‍🍳
                  </span>
                  <h2 className="mt-2">Tu Chef Virtual</h2>
                  <p className="text-muted">
                    Inicia sesión para ver tus recetas
                  </p>
                </div>
                {/* Formulario de Bootstrap */}
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label>Usuario</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nombre de usuario"
                      value={strUser}
                      onChange={(e) => setStrUser(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Form.Group>

                  {/* Botón principal */}
                  <Button variant="success" type="submit" className="w-100">
                    Iniciar Sesión
                  </Button>
                </Form>

                {/* Botón secundario para registrarse */}
                <div className="text-center mt-3">
                  ¿No tienes cuenta?
                  <Button variant="link" onClick={goToRegister}>
                    Regístrarse
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;
