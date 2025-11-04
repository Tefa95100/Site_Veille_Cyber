import { useEffect, useState } from "react";
import { getArticle } from "../api.js";
import { useParams, Link } from "react-router-dom";

export default function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await getArticle(id);
        setArticle(data);
      } catch (err) {
        if (err.status === 404) {
          setError("Article introuvable.");
        } else {
          setError(err.message || "Erreur chargement article.");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <p>Chargement…</p>;
  if (error)
    return (
      <div style={{ padding: "1rem", color: "red" }}>
        <p>{error}</p>
        <p>
          <Link to="/" style={{ color: "#0066cc" }}>
            ← Retour aux articles
          </Link>
        </p>
      </div>
    );
  if (!article) return null;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>{article.title}</h1>
      
      <div style={{ margin: "1rem 0" }}>
        {article.summary ? (
          <p>{article.summary}</p>
        ) : (
          <p style={{ fontStyle: "italic", color: "#666" }}>
            Pas encore de résumé
          </p>
        )}
      </div>

      <p>
        <strong>Thème :</strong>{" "}
        {article.theme ? (
          article.theme
        ) : (
          <i style={{ color: "#666" }}>—</i>
        )}
      </p>

      <p>
        <strong>URL :</strong>{" "}
        {article.url ? (
          <a href={article.url} target="_blank" rel="noreferrer">
            {article.url}
          </a>
        ) : (
          <i style={{ color: "#666" }}>Pas de lien source</i>
        )}
      </p>

      <div style={{ marginTop: "1rem" }}>
        <Link to="/" style={{ color: "#0066cc" }}>
          ← Retour aux articles
        </Link>
      </div>
    </div>
  );
}
