// src/menu/MainLayout.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Container, Button, Offcanvas, Nav } from "react-bootstrap";
import Swal from "sweetalert2";
// Importamos los iconos
import {
  List as MenuIcon,
  HouseFill,
  Robot,
  BookmarkStar,
  GraphUp,
  BoxArrowRight,
  QuestionCircleFill,
  Sliders,
  ShieldExclamation,
} from "react-bootstrap-icons";

// Importamos TODOS los componentes que el menú puede cargar
import Inicio from "./inicio/Inicio";
import AsistenteIA from "./asistente/Asistente";
import MiRecetario from "./recetario/Recetario";
import MonitorCalorias from "./calorias/Calorias";
import Preferencias from "./preferencias/Preferencias";
import Alergias from "./alergias/Alergias";
import { URL, ROUTES } from "../Routes";

function MainLayout() {
  const [showMenu, setShowMenu] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const navigate = useNavigate();
  const [activeComponent, setActiveComponent] = useState("inicio");

  // 1. Carga el menú desde el servidor (esto no cambia)
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        // Asumiendo que tu servidor está en 3111 y la tabla es 'menu'
        const response = await fetch(URL + ROUTES.MENU);
        if (!response.ok) throw new Error("No se pudo cargar el menú");
        const data = await response.json();
        setMenuItems(data.filter((item) => item.booleanVisible));
      } catch (error) {
        console.error("Error fetching menu:", error);
      }
    };
    fetchMenu();
  }, []);
  // 2. Funciones de Offcanvas y Logout (Logout no cambia)
  const handleCloseMenu = () => setShowMenu(false);
  const handleShowMenu = () => setShowMenu(true);
  const handleLogout = () => {
    localStorage.removeItem("IdUser");
    Swal.fire({
      title: "¿Estás seguro de que quieres cerrar sesión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cerrar sesión",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Cerrando sesión",
          icon: "success",
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 1000,
        });
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    });
  };
  // 3. Mapeo de Nombres (DB) a Iconos (React) (no cambia)
  const getMenuIcon = (strName) => {
    switch (strName) {
      case "Inicio":
        return <HouseFill className="me-2" />;
      case "Asistente IA":
        return <Robot className="me-2" />;
      case "Mi Recetario":
        return <BookmarkStar className="me-2" />;
      case "Monitor de Calorías":
        return <GraphUp className="me-2" />;
      case "Mis Preferencias":
        return <Sliders className="me-2" />;
      case "Gestión de Alergias":
        return <ShieldExclamation className="me-2" />;
      default:
        return <QuestionCircleFill className="me-2" />;
    }
  };
  // Esta función renderiza el componente basado en el estado 'activeComponent'
  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "inicio":
        return <Inicio />;
      case "asistente":
        return <AsistenteIA />;
      case "recetario":
        return <MiRecetario />;
      case "calorias":
        return <MonitorCalorias />;
      case "preferencias":
        return <Preferencias />;
      case "alergias":
        return <Alergias />;
      default:
        return <Inicio />;
    }
  };

  return (
    <>
      <Navbar bg="success" variant="dark" expand={false} sticky="top">
        <Container fluid>
          <Button variant="outline-light" onClick={handleShowMenu}>
            <MenuIcon size={24} />
          </Button>
          <Link to={"/"} style={{ textDecoration: "none" }}>
            <Navbar.Brand to="#home" className="mx-auto">
              👨‍🍳 Tu Chef Virtual
            </Navbar.Brand>
          </Link>
          <Button variant="outline-light" onClick={handleLogout}>
            <BoxArrowRight size={24} />
          </Button>
        </Container>
      </Navbar>

      <Offcanvas show={showMenu} onHide={handleCloseMenu}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menú Principal</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            {menuItems.map((item) => {
              const icon = getMenuIcon(item.strName);

              return (
                <Nav.Link
                  key={item.intIdRow}
                  onClick={() => {
                    setActiveComponent(item.strArchive.toLowerCase());
                    handleCloseMenu();
                  }}
                  className="d-flex align-items-center fs-5 my-1"
                  style={{ cursor: "pointer" }}
                >
                  {icon}
                  {item.strName}
                </Nav.Link>
              );
            })}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      <main>{renderActiveComponent()}</main>
    </>
  );
}

export default MainLayout;
