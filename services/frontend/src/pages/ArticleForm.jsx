import { useEffect, useState } from "react";
import { createArticle, fetchArticle, updateArticle } from "../api/articles.js";
import { useNavigate, useParams } from "react-router-dom";

export default function ArticleForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [theme, setTheme] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!isEdit) return;
      try {
        const data = await fetchArticle(id);
        setTitle(data.title || "");
        setUrl(data.url || "");
        setTheme(data.theme || "");
      } catch (err) {
        setError(err.message || "Impossible de charger l'article.");
      }
    }
    load();
  }, [id, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title || title.trim().length < 3) {
        setError("Le titre doit faire au moins 3 caractères.");
        return;
    }
    if (!url) {
        setError("L'URL est obligatoire.");
        return;
    }

    const payload = {
      title: title.trim(),
      url: url.trim(),
      theme: theme.trim() || null,
    };

    try {
      if (isEdit) {
        await updateArticle(id, payload);
      } else {
        await createArticle(payload);
      }
      navigate("/articles");
    } catch (err) {
      if (err.code === "duplicate_url") {
        setError("Cette URL existe déjà.");
      } else if (err.code === "invalid_payload") {
        setError("Données invalides. Vérifie les champs.");
      } else {
        setError(err.message || "Erreur lors de l'enregistrement.");
      }
    }
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1>{isEdit ? "Modifier l'article" : "Nouvel article"}</h1>

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem", maxWidth: "400px" }}>
        <div>
          <label>
            Titre<br/>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Zero Trust in Production"
            />
          </label>
        </div>

        <div>
          <label>
            URL<br/>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://exemple.com/article"
            />
          </label>
        </div>

        <div>
          <label>
            Thème (optionnel)<br/>
            <input
              value={theme}
              onChange={e => setTheme(e.target.value)}
              placeholder="security, ai, pentest…"
            />
          </label>
        </div>

        <button type="submit">
          {isEdit ? "Enregistrer" : "Créer"}
        </button>
      </form>
    </div>
  );
}
