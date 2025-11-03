import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NavBar />

      <main style={{ flex: 1, maxWidth: 960, margin: "1rem auto", padding: "0 1rem" }}>
        <Outlet />
      </main>

      <footer style={{ textAlign: "center", padding: "1rem", opacity: 0.6 }}>
        MVP • Sprint 1
      </footer>
    </div>
  );
}
