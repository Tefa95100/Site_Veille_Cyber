import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        MVP • Sprint 1
      </footer>
    </div>
  );
}
