import { useEffect, useState, useSyncExternalStore } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useBusquedaCatalogo } from "../hooks/useBusquedaCatalogo.js";
import { useListaConsulta } from "../hooks/useListaConsulta.js";
import { marcaAdmin } from "../utils/marcaAdmin.js";
import BuscadorCatalogo from "./BuscadorCatalogo.jsx";

const linkClass = ({ isActive }) =>
  `flex min-h-11 items-center gap-1.5 text-sm tracking-wide transition-colors ${
    isActive ? "text-shu" : "text-sumi-soft hover:text-sumi"
  }`;

const linkMenuClass = ({ isActive }) =>
  `block rounded-sm px-3 py-2.5 text-base transition-colors ${
    isActive ? "bg-shu/10 text-shu" : "text-sumi hover:bg-sumi/5"
  }`;

export default function Navbar() {
  const items = useListaConsulta();
  const cantidad = items.reduce((total, item) => total + item.cantidad, 0);
  const conPanel = useSyncExternalStore(
    marcaAdmin.subscribe,
    marcaAdmin.getSnapshot,
    marcaAdmin.getSnapshot,
  );
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cerrarMenu = () => setMenuAbierto(false);

  // Buscador: solo en /catalogo (por ahora). Desde 1024 px va en línea; antes, detrás de la lupa.
  const enCatalogo = useLocation().pathname === "/catalogo";
  const busqueda = useBusquedaCatalogo();
  const [lupaAbierta, setLupaAbierta] = useState(false);
  const buscadorAbierto = enCatalogo && lupaAbierta;

  // Escape cierra el menú del celular y el buscador desplegado.
  useEffect(() => {
    if (!menuAbierto && !buscadorAbierto) return;
    const alPresionar = (event) => {
      if (event.key !== "Escape") return;
      setMenuAbierto(false);
      setLupaAbierta(false);
    };
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [menuAbierto, buscadorAbierto]);

  // Links principales (Consulta va aparte: siempre visible, con su contador).
  const links = [
    { to: "/", texto: "Inicio", end: true },
    { to: "/catalogo", texto: "Catálogo" },
    { to: "/sobre", texto: "Sobre Kamae" },
  ];

  const consulta = (
    <NavLink to="/consulta" className={linkClass} onClick={cerrarMenu}>
      Consulta
      {cantidad > 0 && (
        <span
          className="flex h-5 min-w-5 items-center justify-center rounded-full bg-shu px-1 text-xs text-washi"
          aria-label={`${cantidad} productos`}
        >
          {cantidad}
        </span>
      )}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-10 border-b border-sumi/10 bg-washi/90 backdrop-blur">
      <nav className="mx-auto max-w-6xl px-4 sm:px-6" aria-label="Principal">
        <div className="flex min-h-16 items-center justify-between gap-4 lg:gap-8">
          <Link
            to="/"
            className="flex min-h-11 items-center gap-2"
            onClick={cerrarMenu}
          >
            <span className="font-serif text-xl font-semibold tracking-widest">
              KAMAE
            </span>
            <span className="font-serif text-sm text-shu" aria-hidden="true">
              構え
            </span>
          </Link>

          {enCatalogo && (
            <BuscadorCatalogo
              id="busqueda"
              className="hidden max-w-[420px] flex-1 lg:block"
            />
          )}

          <div className="flex items-center gap-2 sm:gap-6">
            {enCatalogo && (
              <button
                type="button"
                onClick={() => {
                  setLupaAbierta((abierta) => !abierta);
                  setMenuAbierto(false);
                }}
                aria-expanded={buscadorAbierto}
                aria-controls="buscador-desplegable"
                aria-label={
                  buscadorAbierto ? "Cerrar búsqueda" : "Buscar en el catálogo"
                }
                className="relative flex h-11 w-11 items-center justify-center rounded-sm text-sumi hover:bg-sumi/5 lg:hidden"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="6.5" />
                  <path strokeLinecap="round" d="M16 16l4 4" />
                </svg>
                {/* Punto: hay una búsqueda activa aunque el campo esté cerrado. */}
                {busqueda && !buscadorAbierto && (
                  <span
                    className="absolute top-2 right-2 h-2 w-2 rounded-full bg-shu"
                    aria-hidden="true"
                  />
                )}
              </button>
            )}

            {/* Escritorio: todos los links en línea */}
            <div className="hidden items-center gap-6 sm:flex">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                  {l.texto}
                </NavLink>
              ))}
              {consulta}
              {/* Solo con sesión de admin o vendedor en este navegador (utils/marcaAdmin.js). */}
              {conPanel && (
                <NavLink to="/admin" className={linkClass}>
                  Panel
                </NavLink>
              )}
            </div>

            {/* Celular: Consulta siempre visible + botón de menú */}
            <div className="flex items-center gap-4 sm:hidden">
              {consulta}
              <button
                type="button"
                onClick={() => {
                  setMenuAbierto((abierto) => !abierto);
                  setLupaAbierta(false);
                }}
                aria-expanded={menuAbierto}
                aria-controls="menu-celular"
                aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-sm text-sumi hover:bg-sumi/5"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  aria-hidden="true"
                >
                  {menuAbierto ? (
                    <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                  ) : (
                    <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {buscadorAbierto && (
          <div id="buscador-desplegable" className="pb-3 lg:hidden">
            <BuscadorCatalogo id="busqueda-celular" autoFocus />
          </div>
        )}

        {menuAbierto && (
          <ul
            id="menu-celular"
            className="space-y-1 border-t border-sumi/10 py-3 sm:hidden"
          >
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.end}
                  className={linkMenuClass}
                  onClick={cerrarMenu}
                >
                  {l.texto}
                </NavLink>
              </li>
            ))}
            {conPanel && (
              <li>
                <NavLink
                  to="/admin"
                  className={linkMenuClass}
                  onClick={cerrarMenu}
                >
                  Panel
                </NavLink>
              </li>
            )}
          </ul>
        )}
      </nav>
    </header>
  );
}
