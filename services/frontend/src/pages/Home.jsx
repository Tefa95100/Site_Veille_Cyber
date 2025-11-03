import { useEffect, useState } from "react";
import { listArticles } from "../api.js";
import { Link } from "react-router-dom";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    async function load() {
        try {
            setLoading(true);
            setError(null);
            // on ne filtre pas ici côté front, on laisse le backend gérer selon l'utilisateur connecté
            const data = await listArticles();
            setArticles(data);
        } catch (err) {
            setError(err.message || "Impossible de charger les articles");
        } finally {
            setLoading(false);
        }
    }
    load();
  }, []);

  if (loading) return <p>Chargement…</p>;
  if (error)   return <p style={{ color: "red" }}>{error}</p>;

  if (articles.length === 0) {
    return (
      <div style={{ padding: "1rem" }}>
        <h1>Articles récents</h1>
        <p>Aucun article pour le moment.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Articles récents</h1>

      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "1rem" }}>
        {articles.map(a => (
          <li
            key={a.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "6px",
              padding: "1rem",
            }}
          >
            <h2 style={{ margin: "0 0 0.5rem" }}>
              <Link to={`/articles/${a.id}`}>{a.title}</Link>
            </h2>

            <div style={{ fontSize: "0.9rem", color: "#555" }}>
              <span><b>Thème:</b> {a.theme || "—"}</span>
              {" · "}
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#0066cc" }}
              >
                Source
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
