// src/menu/Preferencias/Preferencias.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { successAlert, errorAlert } from "../../SweetAlert/Alerts.js";
// (No necesitamos importar más iconos, ya que usaremos emojis)
import { ChatQuoteFill, Save } from "react-bootstrap-icons";
import { URL, ROUTES } from "../../Routes";

// --- CAMBIO AQUÍ: Convertimos las listas a Objetos ---
// Ahora cada item tiene un 'id' (para la DB), 'name' (visible) y 'emoji'
const PREDEFINED_LIKES_DATA = [
  { id: "pollo", name: "Pollo", emoji: "🐔" },
  { id: "res", name: "Res", emoji: "🐄" },
  { id: "pescado", name: "Pescado", emoji: "🐟" },
  { id: "cerdo", name: "Cerdo", emoji: "🐖" },
  { id: "vegetariano", name: "Vegetariano", emoji: "🌱" },
  { id: "vegano", name: "Vegano", emoji: "🌿" },
  { id: "pasta", name: "Pasta", emoji: "🍝" },
  { id: "arroz", name: "Arroz", emoji: "🍚" },
  { id: "ensaladas", name: "Ensaladas", emoji: "🥗" },
  { id: "sopas", name: "Sopas", emoji: "🍲" },
  { id: "mariscos", name: "Mariscos", emoji: "🦐" },
  { id: "frutas", name: "Frutas", emoji: "🍓" },
  { id: "verduras", name: "Verduras", emoji: "🥕" },
  { id: "legumbres", name: "Legumbres", emoji: "🫘" },
];

const PREDEFINED_DISLIKES_DATA = [
  { id: "cebolla", name: "Cebolla", emoji: "🧅" },
  { id: "cilantro", name: "Cilantro", emoji: "🌿" },
  { id: "brocoli", name: "Brócoli", emoji: "🥦" },
  { id: "champinones", name: "Champiñones", emoji: "🍄" },
  { id: "picante", name: "Picante", emoji: "🌶️" },
  { id: "lacteos", name: "Lácteos", emoji: "🥛" },
  { id: "huevo", name: "Huevo", emoji: "🥚" },
  { id: "gluten", name: "Gluten", emoji: "🍞" },
  { id: "mani", name: "Maní", emoji: "🥜" },
  { id: "soja", name: "Soja", emoji: "🌱" },
  { id: "trigo", name: "Trigo", emoji: "🌾" },
];
// ------------------------------------------------------------

function Preferencias() {
  // --- CAMBIO AQUÍ: El 'Set' ahora guardará los 'id' (ej: "pollo") ---
  const [likes, setLikes] = useState(new Set());
  const [dislikes, setDislikes] = useState(new Set());
  const [customNotes, setCustomNotes] = useState("");

  const [status, setStatus] = useState({
    loading: true,
    error: "",
    success: "",
  });

  // 1. Cargar datos existentes...
  useEffect(() => {
    const loadData = async () => {
      const userId = localStorage.getItem("IdUser");
      if (!userId) {
        setStatus({
          loading: false,
          error: "No se pudo encontrar el ID de usuario.",
          success: "",
        });

        errorAlert(status.error);
        return;
      }

      try {
        const response = await fetch(
          `${URL}${ROUTES.PREFERENCES.GET}?userId=${userId}`
        );
        if (!response.ok) throw new Error("Error al cargar datos.");

        const data = await response.json();

        // --- CAMBIO AQUÍ: La lógica de carga es la misma ---
        setLikes(new Set(data.structured_likes || []));
        setDislikes(new Set(data.structured_dislikes || []));
        setCustomNotes(data.custom_notes || "");

        setStatus({ loading: false, error: "", success: "" });
      } catch (err) {
        console.error("Error loading preferences:", err);
        setStatus({
          loading: false,
          error: "Error de red al cargar preferencias.",
          success: "",
        });
        errorAlert("Error de red al cargar preferencias.");
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (status.success) {
      successAlert("¡Éxito!", status.success);
    }
    if (status.error) {
      errorAlert(status.error);
    }
  }, [status.success, status.error]);

  // 2. Función para manejar el clic...
  // --- CAMBIO AQUÍ: 'item' ahora es el 'id' (string) ---
  const handleToggle = (itemId, type) => {
    const stateSet = type === "likes" ? likes : dislikes;
    const setState = type === "likes" ? setLikes : setDislikes;

    const newSet = new Set(stateSet);
    if (newSet.has(itemId)) {
      newSet.delete(itemId);
    } else {
      newSet.add(itemId);
    }
    setState(newSet);
  };

  // 3. Función para guardar...
  const handleSave = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: "" });

    const userId = localStorage.getItem("IdUser");

    const dataToSave = {
      structured_likes: [...likes],
      structured_dislikes: [...dislikes],
      custom_notes: customNotes,
    };

    try {
      const response = await fetch(`${URL}${ROUTES.PREFERENCES.SAVE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          preferences: dataToSave,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "No se pudo guardar.");
      }

      setStatus({
        loading: false,
        error: "",
        success: "¡Perfil culinario guardado con éxito!",
      });
    } catch (err) {
      console.error("Error saving preferences:", err);
      setStatus({
        loading: false,
        error: err.message || "Error de red al guardar.",
        success: "",
      });
    }
  };

  if (status.loading && !status.error) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Spinner animation="border" role="status" variant="success">
          <span className="visually-hidden">Cargando preferencias...</span>
        </Spinner>
        <h4 className="ms-3">Cargando tus preferencias...</h4>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="d-flex align-items-center mb-4">
            Mi Perfil Culinario
          </Card.Title>
          <Card.Text className="text-muted mb-4">
            Selecciona tus gustos y disgustos. Esto ayudará al Asistente IA a
            darte las mejores recomendaciones y a aprender sobre ti.
          </Card.Text>

          <Form onSubmit={handleSave}>
            <Row>
              {/* COLUMNA IZQUIERDA: GUSTOS */}
              <Col md={6} className="mb-4">
                <Form.Group>
                  <Form.Label as="h5" className="d-flex align-items-center">
                    Me Gusta
                  </Form.Label>
                  <div
                    className="p-3 bg-light border rounded"
                    style={{ minHeight: "150px" }}
                  >
                    {PREDEFINED_LIKES_DATA.map((item) => (
                      <Button
                        key={`like-${item.id}`}
                        variant={
                          likes.has(item.id) ? "success" : "outline-secondary"
                        }
                        onClick={() => handleToggle(item.id, "likes")}
                        className="m-1 rounded-pill"
                      >
                        <span className="me-2">{item.emoji}</span>
                        {item.name}
                      </Button>
                    ))}
                  </div>
                  <Form.Text className="text-muted">
                    Haz clic para seleccionar o deseleccionar.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6} className="mb-4">
                <Form.Group>
                  <Form.Label as="h5" className="d-flex align-items-center">
                    No Me Gusta
                  </Form.Label>
                  <div
                    className="p-3 bg-light border rounded"
                    style={{ minHeight: "150px" }}
                  >
                    {/* --- CAMBIO AQUÍ: Mapeamos el nuevo array de objetos --- */}
                    {PREDEFINED_DISLIKES_DATA.map((item) => (
                      <Button
                        key={`dislike-${item.id}`}
                        // Comparamos con el 'id'
                        variant={
                          dislikes.has(item.id) ? "danger" : "outline-secondary"
                        }
                        // Enviamos el 'id' al hacer clic
                        onClick={() => handleToggle(item.id, "dislikes")}
                        className="m-1 rounded-pill"
                      >
                        {/* ¡Aquí añadimos el emoji! */}
                        <span className="me-2">{item.emoji}</span>
                        {item.name}
                      </Button>
                    ))}
                  </div>
                  <Form.Text className="text-muted">
                    Haz clic para seleccionar o deseleccionar.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* CAJA DE TEXTO (No cambia) */}
            <Form.Group className="mb-4">
              <Form.Label as="h5" className="d-flex align-items-center">
                <ChatQuoteFill className="me-2 text-info" />
                Notas Adicionales (Opcional)
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Ej: Me gusta la comida muy especiada, sin picante, prefiero cocinar al vapor, soy intolerante a la lactosa (pero sin ser alergia grave), me gusta experimentar con nuevas cocinas..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.customNotes)}
              />
              <Form.Text className="text-muted">
                Aquí puedes añadir cualquier detalle extra. El Asistente IA lo
                tendrá en cuenta y podrá actualizarlo con lo que aprenda.
              </Form.Text>
            </Form.Group>

            <hr className="my-4" />

            {/* Botón de Guardar y Alertas (No cambia) */}
            <div className="d-flex align-items-center justify-content-end">
              {/* ... (resto del JSX idéntico) ... */}
              <Button
                variant="primary"
                type="submit"
                disabled={status.loading}
                className="ms-3"
              >
                <Save className="me-2" />{" "}
                {status.loading ? "Guardando..." : "Guardar Perfil Culinario"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Preferencias;
