import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import { ShieldExclamation, Save, XCircleFill } from "react-bootstrap-icons";

import { successAlert, errorAlert } from "../../SweetAlert/Alerts";
import { URL, ROUTES } from "../../Routes";

const COMMON_ALLERGIES_DATA = [
  { id: "mani", name: "Maní (Cacahuete)" },
  { id: "mariscos", name: "Mariscos (Crustáceos)" },
  { id: "lacteos", name: "Lácteos (Leche)" },
  { id: "huevo", name: "Huevo" },
  { id: "gluten", name: "Gluten (Trigo)" },
  { id: "soja", name: "Soja" },
  { id: "pescado", name: "Pescado" },
  { id: "nueces", name: "Nueces de árbol (Almendras, etc.)" },
];
// --------------------------------------------------------

function Alergias() {
  // Estado para los checkboxes
  const [commonAllergies, setCommonAllergies] = useState(new Set());
  // Estado para los tags personalizados
  const [customAllergies, setCustomAllergies] = useState([]);
  // Estado para el texto del input del tag
  const [tagInput, setTagInput] = useState("");

  const [status, setStatus] = useState({
    loading: true,
    error: "",
    success: "",
  });

  // 1. Cargar datos existentes
  useEffect(() => {
    const loadData = async () => {
      const userId = localStorage.getItem("IdUser");
      try {
        const response = await fetch(
          `${URL}${ROUTES.ALLERGIES.GET}?userId=${userId}`
        );
        if (!response.ok) throw new Error("Error al cargar datos.");

        const data = await response.json(); // data es un array: ["mani", "sulfitos"]

        const commonSet = new Set();
        const customArray = [];
        const commonIds = new Set(COMMON_ALLERGIES_DATA.map((a) => a.id));

        // Clasificamos las alergias guardadas
        data.forEach((allergy) => {
          if (commonIds.has(allergy)) {
            commonSet.add(allergy); // Es una alergia común
          } else {
            customArray.push(allergy); // Es una alergia personalizada (tag)
          }
        });

        setCommonAllergies(commonSet);
        setCustomAllergies(customArray);
        setStatus({ loading: false, error: "", success: "" });
      } catch (err) {
        console.error("Error loading allergies:", err);
        setStatus({
          loading: false,
          error: "Error de red al cargar alergias.",
          success: "",
        });
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
  // 2. Manejar clics en los checkboxes
  const handleCommonToggle = (allergyId) => {
    const newSet = new Set(commonAllergies);
    if (newSet.has(allergyId)) {
      newSet.delete(allergyId);
    } else {
      newSet.add(allergyId);
    }
    setCommonAllergies(newSet);
  };

  // 3. Lógica para añadir un tag
  const addTag = () => {
    const newTag = tagInput.trim().toLowerCase(); // Normalizamos
    if (newTag && !customAllergies.includes(newTag)) {
      setCustomAllergies([...customAllergies, newTag]);
    }
    setTagInput(""); // Limpiamos el input
  };

  // Añadir tag al presionar "Enter"
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Evita que el formulario se envíe
      addTag();
    }
  };

  // Eliminar un tag
  const removeTag = (tagToRemove) => {
    setCustomAllergies(customAllergies.filter((tag) => tag !== tagToRemove));
  };

  // 4. Lógica para guardar TODO
  const handleSave = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: "" });

    const userId = localStorage.getItem("IdUser");

    // Combinamos las alergias de los checks y los tags en un solo array
    const allAllergies = [...commonAllergies, ...customAllergies];

    try {
      const response = await fetch(`${URL}${ROUTES.ALLERGIES.SAVE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          allergies: allAllergies, // Enviamos el array combinado
        }),
      });

      if (!response.ok) throw new Error("No se pudo guardar.");

      setStatus({
        loading: false,
        error: "",
        success: "¡Alergias guardadas con éxito!",
      });
    } catch (err) {
      setStatus({
        loading: false,
        error: "Error de red al guardar.",
        success: "",
      });
    }
  };

  if (status.loading) {
    /* Spinner de Carga... */
  }

  return (
    <Container className="mt-4">
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="d-flex align-items-center mb-3">
            <ShieldExclamation className="me-2 text-danger" size={28} />
            Gestión de Alergias
          </Card.Title>

          <Alert variant="danger" className="d-flex align-items-center">
            <ShieldExclamation size={40} className="me-3" />
            <div>
              <strong>¡Información de Seguridad Crítica!</strong>
              <br />
              Las recetas generadas excluirán ESTRICTAMENTE todos los
              ingredientes que añadas aquí.
            </div>
          </Alert>

          <Form onSubmit={handleSave}>
            {/* SECCIÓN 1: Alergias Comunes */}
            <Form.Group className="mb-4">
              <Form.Label as="h5">Alergias Comunes</Form.Label>
              <div className="p-3 bg-light border rounded">
                <Row>
                  {COMMON_ALLERGIES_DATA.map((allergy) => (
                    <Col md={6} key={allergy.id}>
                      <Form.Check
                        type="checkbox"
                        id={`check-${allergy.id}`}
                        label={allergy.name}
                        checked={commonAllergies.has(allergy.id)}
                        onChange={() => handleCommonToggle(allergy.id)}
                        className="fs-5"
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            </Form.Group>

            {/* SECCIÓN 2: Alergias Personalizadas (Tags) */}
            <Form.Group className="mb-4">
              <Form.Label as="h5">Otras Alergias o Intolerancias</Form.Label>
              <Form.Text className="text-muted d-block mb-2">
                Escribe una alergia (ej: sulfitos) y presiona "Enter" o
                "Añadir".
              </Form.Text>
              <div className="d-flex">
                <Form.Control
                  type="text"
                  placeholder="Ej: sulfitos, apio, mostaza..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
                <Button
                  variant="outline-primary"
                  onClick={addTag}
                  className="ms-2"
                >
                  Añadir
                </Button>
              </div>

              {/* Contenedor de Tags */}
              <div className="mt-3">
                {customAllergies.map((tag) => (
                  <Badge
                    pill
                    bg="warning" // Color de alerta
                    text="dark"
                    key={tag}
                    className="fs-6 me-2 p-2"
                  >
                    {tag}
                    <XCircleFill
                      className="ms-2"
                      style={{ cursor: "pointer" }}
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </Form.Group>

            <hr className="my-4" />

            {/* Botón de Guardar y Alertas */}
            <div className="d-flex align-items-center justify-content-end">
              {/* ... (Alertas de estado) ... */}
              <Button
                variant="primary"
                type="submit"
                disabled={status.loading}
                className="ms-3"
              >
                <Save className="me-2" />{" "}
                {status.loading ? "Guardando..." : "Guardar Alergias"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Alergias;
