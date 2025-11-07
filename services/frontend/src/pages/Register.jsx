import { useState } from "react";
import { authRegister } from "../api.js";
import { useNavigate, Link } from "react-router-dom";

const AVAILABLE_THEMES = [
  { value: "security", label: "Sécurité" },
  { value: "cloud", label: "Cloud" },
  { value: "pentest", label: "Pentest" },
  { value: "ia", label: "Intelligence artificielle" },
  { value: "vulnerability", label: "Vulnérabilités" },
  { value: "other", label: "Autre" },
];

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [themes, setThemes] = useState([]);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function toggleTheme(t) {
    setThemes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== password2) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await authRegister({ username, email, password, themes });
      navigate("/login");
    } catch (err) {
      setError(err.message || "Inscription impossible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">Créer un compte</h1>
        <p className="auth-subtitle">Reçois tes actus cybersécurité.</p>

        {error ? <p className="auth-error">{error}</p> : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Nom d’utilisateur
            <input
              className="auth-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          <label className="auth-label">
            Email
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="auth-label">
            Mot de passe
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <label className="auth-label">
            Confirmer le mot de passe
            <input
              className="auth-input"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
          </label>

          <fieldset style={{ marginTop: "0.5rem" }}>
            <legend style={{ fontSize: "0.78rem", marginBottom: "0.4rem" }}>
              Thèmes qui t’intéressent
            </legend>
            <div
              style={{
                display: "grid",
                gap: "0.4rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              }}
            >
              {AVAILABLE_THEMES.map((t) => (
                <label key={t.value} style={{ fontSize: "0.75rem" }}>
                  <input
                    type="checkbox"
                    checked={themes.includes(t.value)}
                    onChange={() => toggleTheme(t.value)}
                    style={{ marginRight: "0.35rem" }}
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </fieldset>

          <button className="auth-btn" disabled={loading} style={{ marginTop: "0.75rem" }}>
            {loading ? "Création…" : "Créer le compte"}
          </button>
        </form>

        <p className="auth-footer">
          Déjà inscrit ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
