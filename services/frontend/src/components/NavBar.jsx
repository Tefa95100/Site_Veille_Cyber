import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { favoritesMine } from "../api";
import { onFavoriteChange } from "../favorite-events";

export default function NavBar() {
  const { user, access, logout } = useAuth();
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    if (dark) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    let abort = false;
    async function fetchFavs() {
      if (!user || !access) {
        setFavCount(0);
        return;
      }
      try {
        const data = await favoritesMine(access);
          if (!abort) setFavCount(Array.isArray(data) ? data.length : 0);
      } catch (_) {
      }
    }
    fetchFavs();
    return () => {
      abort = true;
    };
  }, [user, access]);

  useEffect(() => {
    const off = onFavoriteChange(({ favorited }) => {
      setFavCount((c) => c + (favorited ? 1 : -1));
    });
    return off;
  }, []);

  const linkClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

  return (
    <header className="topbar">
      <nav className="topbar__inner">
        <div className="topbar__left">
          {/*<button
            className="nav-burger"
            aria-label="Ouvrir le menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>*/}

          <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
            CyberFeed
          </Link>

          <div className={`topbar__links ${menuOpen ? "open" : ""}`}>
            <NavLink to="/" className={linkClass} onClick={() => setMenuOpen(false)}>
              Accueil
            </NavLink>

            <NavLink to="/articles" className={linkClass} onClick={() => setMenuOpen(false)}>
              Articles
            </NavLink>

            {/* 
            <NavLink
              to="/health"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              onClick={() => setMenuOpen(false)}
            >
              Health
            </NavLink>
            */}

            <NavLink to="/best-practices" className={linkClass} onClick={() => setMenuOpen(false)}>
              Bonnes pratiques
            </NavLink>

            <NavLink to="/favorites" className={linkClass} onClick={() => setMenuOpen(false)}>
              Favoris{user ? <span className="badge"> {favCount}</span> : null}
            </NavLink>

            {user?.is_staff && (
              <a
                href="http://localhost:8000/admin/"
                className="nav-link"
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuOpen(false)}
              >
                Admin
              </a>
            )}
          </div>
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
              <NavLink to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>
                {user.username}
              </NavLink>
              <button onClick={logout} className="nav-link">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>
                Connexion
              </NavLink>
              <NavLink to="/register" className="nav-link" onClick={() => setMenuOpen(false)}>
                Inscription
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
