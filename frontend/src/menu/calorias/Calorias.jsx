// src/menu/MonitorCalorias/MonitorCalorias.jsx
import React from 'react';
import { Container, Card } from 'react-bootstrap';

function MonitorCalorias() {
  return (
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <Card.Title>Monitor de Calorías 📊</Card.Title>
          <Card.Text>
            Lleva un registro de tu consumo calórico diario.
            Aquí podrás ver gráficas de tu progreso y establecer metas 
            nutricionales.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
}
export default MonitorCalorias;