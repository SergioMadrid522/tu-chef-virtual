import { useState, useEffect, useRef } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  InputGroup,
  Spinner,
  Alert,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import {
  Robot,
  SendFill,
  BookmarkPlus,
  PersonFill,
  Fire,
  ListUl,
  ListOl,
} from "react-bootstrap-icons";
import { URL, ROUTES } from "../../Routes"; // Ajusta la ruta (../.. points to src/)
import "./AsistenteIA.css"; // Crearemos este archivo para los estilos del chat
import { successAlert, errorAlert } from "../../SweetAlert/Alerts.js";

const RecipeCard = ({ receta, onSave, isSaved }) => (
  <Card className="mb-3 shadow-sm border-success">
    <Card.Body>
      <Row>
        <Col>
          <Card.Title>{receta.titulo}</Card.Title>
        </Col>
        <Col xs="auto">
          <Badge pill bg="danger" className="p-2 fs-6">
            <Fire className="me-1" /> {receta.kcal || "N/A"} kcal
          </Badge>
        </Col>
      </Row>
      <Card.Text className="text-muted fst-italic">
        {receta.descripcion}
      </Card.Text>
      <hr />
      <Row>
        <Col md={5}>
          <h5>
            <ListUl className="me-1" /> Ingredientes
          </h5>
          <ul>
            {receta.ingredientes.map((ing, idx) => (
              <li key={idx}>{ing}</li>
            ))}
          </ul>
        </Col>
        <Col md={7}>
          <h5>
            <ListOl className="me-1" /> Instrucciones
          </h5>
          <ol>
            {receta.instrucciones.map((step, idx) => (
              <li key={idx} className="mb-2">
                {step}
              </li>
            ))}
          </ol>
        </Col>
      </Row>
      <Button
        variant={isSaved ? "outline-secondary" : "success"}
        onClick={onSave}
        disabled={isSaved}
        className="mt-2"
      >
        <BookmarkPlus className="me-2" />
        {isSaved ? "Receta Guardada" : "Guardar en Mi Recetario"}
      </Button>
    </Card.Body>
  </Card>
);

function AsistenteIA() {
  const [messages, setMessages] = useState([
    {
      role: "model",
      type: "text",
      content:
        "¡Hola! Soy Tu Chef Virtual. Pídeme una receta basada en tus gustos.",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [isCurrentRecipeSaved, setIsCurrentRecipeSaved] = useState(false);
  const [error, setError] = useState("");

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const messageText = newMessage.trim();
    if (!messageText) return;

    const userId = localStorage.getItem("IdUser");

    // --- CAMBIO 1: Arreglo del "Historial Antiguo" ---
    // Creamos el mensaje del usuario y lo añadimos al historial *primero*.
    // Añadimos type: 'text' para ser consistentes.
    const userMessage = { role: "user", type: "text", content: messageText };
    const newMessagesHistory = [...messages, userMessage];

    // 1. Añade el mensaje del usuario a la UI (usando el nuevo array)
    setMessages(newMessagesHistory);
    setNewMessage("");
    setIsLoading(true);
    setError("");
    setCurrentRecipe(null);
    setIsCurrentRecipeSaved(false);

    try {
      // 2. Llama al nuevo endpoint /chat
      const response = await fetch(`${URL}${ROUTES.CHAT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          message: messageText,
          // Enviamos el historial *actualizado* al servidor
          history: newMessagesHistory,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData.error || "Error en la respuesta del asistente."
        );
      }

      const data = await response.json(); // data = { role: 'model', text: '...' }

      // --- CAMBIO 2: Arreglo de la "Burbuja Vacía" ---
      // Estandarizamos la respuesta del servidor aquí.
      // Nuestro render espera 'type' y 'content'.
      const modelMessage = {
        role: "model",
        type: data.type || "text", // Asigna 'text' por defecto
        // Lee de data.content, pero si no existe, lee de data.text
        content: data.content || data.text,
      };
      // --------------------------------------------------

      // 3. Añade la respuesta *estandarizada* del modelo a la UI
      setMessages((prev) => [...prev, modelMessage]);

      // 4. Si es una receta, la guardamos en el estado
      if (modelMessage.type === "recipe") {
        setCurrentRecipe(modelMessage.content);
      }
    } catch (err) {
      console.error("Error en el chat:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!currentRecipe) return;

    const userId = localStorage.getItem("IdUser");
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${URL}${ROUTES.RECETARIO.SAVE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          titulo: currentRecipe.titulo,
          descripcion: currentRecipe.descripcion,
          kcal: currentRecipe.kcal,
          ingredientes: currentRecipe.ingredientes,
          instrucciones: currentRecipe.instrucciones,
        }),
      });

      if (!response.ok) {
        errorAlert("No se pudo guardar la receta.");
        throw new Error("No se pudo guardar la receta.");
      }
      successAlert("Receta guardada", "¡Se ha guardado en tu recetario!");
      setIsCurrentRecipeSaved(true);
    } catch (err) {
      console.error("Error guardando receta:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Card className="shadow-sm" style={{ height: "calc(100vh - 120px)" }}>
        <Card.Header as="h5" className="d-flex align-items-center">
          <Robot className="me-2 text-success" size={28} />
          Asistente IA
        </Card.Header>

        <Card.Body className="chat-window">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-bubble ${msg.role}`}>
              <div className="chat-bubble-content">
                {msg.role === "user" ? (
                  <PersonFill className="chat-icon" />
                ) : (
                  <Robot className="chat-icon" />
                )}
                {msg.type === "recipe" ? (
                  <RecipeCard
                    receta={msg.content}
                    onSave={handleSaveRecipe}
                    isSaved={
                      currentRecipe === msg.content && isCurrentRecipeSaved
                    }
                  />
                ) : (
                  <span>{msg.content}</span>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="chat-bubble model">
              <div className="chat-bubble-content">
                <Robot className="chat-icon" />
                <Spinner animation="border" size="sm" />
                <span className="ms-2 fst-italic">
                  El chef está pensando...
                </span>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}

          <div ref={chatEndRef} />
        </Card.Body>

        <Card.Footer>
          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Pide una receta (ej: 'pollo con verduras')"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isLoading}
                autoFocus
                style={{ outline: "none" }}
              />
              <Button variant="success" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  <SendFill />
                )}
              </Button>
            </InputGroup>
          </Form>
        </Card.Footer>
      </Card>
    </Container>
  );
}

export default AsistenteIA;
