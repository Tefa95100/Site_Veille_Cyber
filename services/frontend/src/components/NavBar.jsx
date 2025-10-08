import React from "react";
import { Link, NavLink } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
  marginRight: "1rem",
  textDecoration: "none",
  fontWeight: isActive ? 700 : 400
});

export default function NavBar() {
  return (
    <header style={{ borderBottom: "1px solid #eee", padding: "1rem" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link to="/" style={{ fontWeight: 700, textDecoration: "none" }}>Frontend</Link>
        <nav style={{ marginLeft: "auto" }}>
          <NavLink to="/" style={linkStyle} end>Home</NavLink>
          <NavLink to="/health" style={linkStyle}>Health</NavLink>
        </nav>
      </div>
    </header>
  );
}
