import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

export default function NavBar() {
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

          <NavLink
            to="/health"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Health
          </NavLink>
        </div>

        <div className="topbar__right">
          <button
            className="theme-toggle"
            onClick={() => setDark((d) => !d)}
            aria-label="Changer le thème"
          >
            {dark ? "☀️" : "🌙"}
          </button>
          <span className="user-label">non connecté</span>
        </div>
      </nav>
    </header>
  );
}
