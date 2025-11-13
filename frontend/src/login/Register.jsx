import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import "./AuthBackground.css";
import { successAlert, errorAlert } from "../SweetAlert/Alerts.js";
import { URL, ROUTES } from "../Routes";

function Register() {
  const [strUser, setStrUser] = useState("");
  const [strEmail, setStrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!strUser || !strEmail || !password) {
      setError("Por favor, completa todos los campos.");
      errorAlert(error);
      return;
    }

    try {
      const response = await fetch(URL + ROUTES.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strUser, strEmail, password }),
      });

      const data = await response.json();

      if (response.ok) {
        successAlert("Acabas de registrarte", "Ahora puedes iniciar sesión.");
        navigate("/app"); // Volvemos al login
      } else {
        setError(data.error || "No se pudo completar el registro.");
        errorAlert(data.error);
      }
    } catch (error) {
      console.error("Error de red al intentar registrarse:", error);
      setError("No se pudo conectar con el servidor.");
    }
  };

  const goToLogin = () => {
    navigate("/app");
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
                    aria-label="form"
                  >
                    📝
                  </span>
                  <h2 className="mt-2">Crear Cuenta</h2>
                  <p className="text-muted">
                    Ingresa tus datos para registrarte
                  </p>
                </div>

                <Form onSubmit={handleRegister}>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Example@example.com"
                      value={strEmail}
                      onChange={(e) => setStrEmail(e.target.value)}
                    />
                  </Form.Group>

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

                  <Button variant="success" type="submit" className="w-100">
                    Registrarse
                  </Button>
                </Form>

                <div className="text-center mt-3">
                  ¿Ya tienes cuenta?
                  <Button variant="link" onClick={goToLogin}>
                    Inicia Sesión
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

export default Register;
