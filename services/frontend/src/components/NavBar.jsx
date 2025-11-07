import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (dark) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <header className="topbar">
      <nav className="topbar__inner">
        <div className="topbar__left">
          <Link to="/" className="brand">
            CyberFeed
          </Link>

          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Accueil
          </NavLink>

          <NavLink
            to="/articles"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Articles
          </NavLink>

          {/*
            <NavLink
            to="/health"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Health
          </NavLink>
          */}

          {user?.is_staff && (
            <a href="http://localhost:8000/admin/" className="nav-link">
              Admin
            </a>
          )}
        </div>

        <div className="topbar__right">
          <button
            className="theme-toggle"
            onClick={() => setDark((d) => !d)}
            aria-label="Changer le thème"
          >
            {dark ? "☀️" : "🌙"}
          </button>

          {user ? (
            <>
              <NavLink to="/profile" className="nav-link">
                {user.username}
              </NavLink>
              <button onClick={logout} className="nav-link">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">
                Connexion
              </NavLink>
              <NavLink to="/register" className="nav-link">
                Inscription
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}