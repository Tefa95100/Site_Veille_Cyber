import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authUpdateMe, authChangePassword } from "../api";

const AVAILABLE_THEMES = [
  { value: "security", label: "Sécurité" },
  { value: "cloud", label: "Cloud" },
  { value: "pentest", label: "Pentest" },
  { value: "ai", label: "Intelligence artificielle" },
  { value: "vulnerability", label: "Vulnérabilités" },
  { value: "other", label: "Autre" },
];

export default function Profile() {
  const { user, access, setUser } = useAuth();

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [themes, setThemes] = useState([]);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");
  const [message, setMessage] = useState("");
  const [loadedUserId, setLoadedUserId] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (loadedUserId === user.id) return;

    setUsername(user.username || "");
    setEmail(user.email || "");

    const incoming = user?.themes || [];
    const flat = incoming
      .map((t) => (typeof t === "string" ? t : t.value || t.label || ""))
      .filter(Boolean);
    setThemes(flat);
    setLoadedUserId(user.id);
  }, [user, loadedUserId]);

  function toggleTheme(t) {
    setThemes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage("");
    try {
      const updated = await authUpdateMe(access, {
        username,
        email,
        themes,
      });
      setUser(updated);
      setLoadedUserId(updated.id);
      setMessage("Profil mis à jour ✅");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleChangePwd(e) {
    e.preventDefault();
    setMessage("");
    try {
      await authChangePassword(access, {
        old_password: oldPwd,
        new_password: newPwd,
        confirm_password: newPwd2,
      });
      setMessage("Mot de passe modifié ✅");
      setOldPwd("");
      setNewPwd("");
      setNewPwd2("");
      setPwdOpen(false);
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (!user) {
    return <p style={{ margin: "2rem" }}>Chargement / pas connecté…</p>;
  }

  return (
    <div className="profile-shell" style={{ marginTop: "1.5rem" }}>
      <div className="profile-card">
        <h1 className="profile-title">Mon profil</h1>
        <p className="profile-subtitle">
          Mets à jour tes infos et tes thèmes.
        </p>

        <form className="profile-form" onSubmit={handleSave}>
          <label className="auth-label">
            Pseudo
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

          <fieldset style={{ marginTop: "0.75rem" }}>
            <legend style={{ fontSize: "0.8vw", marginBottom: "0.4rem" }}>
              Mes thèmes
            </legend>
            <div
              style={{
                display: "grid",
                gap: "0.4rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              }}
            >
              {AVAILABLE_THEMES.map((t) => (
                <label key={t.value} style={{ fontSize: "0.78vw" }}>
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

          <button className="auth-btn" type="submit" style={{ marginTop: "1rem" }}>
            Enregistrer
          </button>
        </form>

        {message && (
          <p className="auth-info" style={{ marginTop: "0.5rem" }}>
            {message}
          </p>
        )}
      </div>

      <div className="profile-card">
        <h2 className="profile-title" style={{ fontSize: "1vw" }}>
          Sécurité
        </h2>
        {!pwdOpen ? (
          <button className="auth-btn" onClick={() => setPwdOpen(true)}>
            Modifier mon mot de passe
          </button>
        ) : (
          <form className="profile-form" onSubmit={handleChangePwd}>
            <label className="auth-label">
              Ancien mot de passe
              <input
                className="auth-input"
                type="password"
                value={oldPwd}
                onChange={(e) => setOldPwd(e.target.value)}
                required
              />
            </label>
            <label className="auth-label">
              Nouveau mot de passe
              <input
                className="auth-input"
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                required
              />
            </label>
            <label className="auth-label">
              Confirmer le mot de passe
              <input
                className="auth-input"
                type="password"
                value={newPwd2}
                onChange={(e) => setNewPwd2(e.target.value)}
                required
              />
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="auth-btn" type="submit">
                Valider
              </button>
              <button
                type="button"
                className="auth-btn"
                style={{ background: "#94a3b8" }}
                onClick={() => setPwdOpen(false)}
              >
                Annuler
              </button>
            </div>
            {message && (
              <p className="auth-info" style={{ marginTop: "0.4rem" }}>
                {message}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
