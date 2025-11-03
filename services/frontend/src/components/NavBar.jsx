import { Link, NavLink } from "react-router-dom";

export default function NavBar() {
  const linkStyle = {
    padding: "0.5rem 0.75rem",
    textDecoration: "none",
    borderRadius: "6px",
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#222",
  };

  const activeStyle = {
    backgroundColor: "#eee",
  };

  return (
    <header
      style={{
        borderBottom: "1px solid #ddd",
        backgroundColor: "#fafafa",
      }}
    >
      <nav
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "0.75rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Bloc gauche: "branding" + liens */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Link
            to="/"
            style={{
              fontWeight: 600,
              textDecoration: "none",
              color: "#111",
              marginRight: "1rem",
            }}
          >
            CyberFeed
          </Link>

          <NavLink
            to="/"
            style={({ isActive }) =>
              isActive
                ? { ...linkStyle, ...activeStyle }
                : linkStyle
            }
          >
            Accueil
          </NavLink>

          <NavLink
            to="/health"
            style={({ isActive }) =>
              isActive
                ? { ...linkStyle, ...activeStyle }
                : linkStyle
            }
          >
            Health
          </NavLink>

          {/* On prépare déjà la route articles même si Home affiche déjà la liste */}
          <NavLink
            to="/"
            style={({ isActive }) =>
              isActive
                ? { ...linkStyle, ...activeStyle }
                : linkStyle
            }
          >
            Articles
          </NavLink>
        </div>

        {/* Bloc droite: placeholder utilisateur */}
        <div style={{ fontSize: "0.8rem", color: "#555" }}>
          <span>non connecté</span>
          {/* Plus tard: si connecté -> "Bonjour Alice" + bouton Logout */}
        </div>
      </nav>
    </header>
  );
}
