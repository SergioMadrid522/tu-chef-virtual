import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Accordion,
  Spinner,
  Alert,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import { BookmarkStarFill, Fire, ListUl, ListOl } from "react-bootstrap-icons";
import { URL, ROUTES } from "../../Routes";

function MiRecetario() {
  const [recetas, setRecetas] = useState([]);

  const [status, setStatus] = useState({
    loading: true,
    error: "",
  });

  useEffect(() => {
    const fetchRecetas = async () => {
      const userId = localStorage.getItem("IdUser");
      if (!userId) {
        setStatus({
          loading: false,
          error: "No se pudo encontrar el ID de usuario.",
        });
        return;
      }

      try {
        const response = await fetch(
          `${URL}${ROUTES.RECETARIO.GET}?userId=${userId}`
        );

        if (!response.ok) {
          throw new Error("No se pudieron cargar las recetas.");
        }

        const data = await response.json();
        setRecetas(data);
        setStatus({ loading: false, error: "" });
      } catch (err) {
        console.error("Error loading recipes:", err);
        setStatus({ loading: false, error: err.message });
      }
    };

    fetchRecetas();
  }, []);

  const renderContent = () => {
    if (status.loading) {
      return (
        <div className="text-center mt-5">
          <Spinner animation="border" role="status" variant="success">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <h4 className="mt-3">Cargando tu recetario...</h4>
        </div>
      );
    }

    if (status.error) {
      return <Alert variant="danger">Error: {status.error}</Alert>;
    }

    if (recetas.length === 0) {
      return (
        <Alert variant="info">
          <Alert.Heading>¡Tu recetario está vacío!</Alert.Heading>
          <p>
            Ve al **Asistente IA** para generar y guardar tus primeras recetas.
            Aparecerán aquí.
          </p>
        </Alert>
      );
    }

    return (
      <Accordion defaultActiveKey="0" alwaysOpen>
        {recetas.map((receta, index) => (
          <Accordion.Item eventKey={String(index)} key={receta.intIdReceta}>
            <Accordion.Header>
              <div className="d-flex justify-content-between align-items-center w-100 me-3">
                <span className="fw-bold fs-5">{receta.strTitulo}</span>
                <Badge pill bg="danger" className="p-2">
                  <Fire className="me-1" /> {receta.intKcal || "N/A"} kcal
                </Badge>
              </div>
            </Accordion.Header>

            <Accordion.Body>
              <p className="text-muted fst-italic">{receta.txtDescripcion}</p>
              <hr />
              <Row>
                <Col md={5}>
                  <h5>
                    <ListUl className="me-1" /> Ingredientes
                  </h5>
                  <ul>
                    {receta.jsonIngredientes.map((ing, idx) => (
                      <li key={idx}>{ing}</li>
                    ))}
                  </ul>
                </Col>
                <Col md={7}>
                  <h5>
                    <ListOl className="me-1" /> Instrucciones
                  </h5>
                  <ol>
                    {receta.jsonInstrucciones.map((step, idx) => (
                      <li key={idx} className="mb-2">
                        {step}
                      </li>
                    ))}
                  </ol>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    );
  };

  return (
    <Container className="mt-4">
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="d-flex align-items-center mb-4">
            <BookmarkStarFill className="me-2 text-success" size={28} />
            Mi Recetario
          </Card.Title>
          <Card.Text className="text-muted mb-4">
            Aquí encontrarás todas las recetas que has guardado desde el
            Asistente IA. Haz clic en una para ver los detalles.
          </Card.Text>

          {renderContent()}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default MiRecetario;
