import { useEffect, useState } from "react";
import { getArticle } from "../api.js";
import { useParams, Link } from "react-router-dom";

const FALLBACK_IMG =
  "/public/images/Bob.jpg";

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
        setError(err.message || "Erreur chargement article.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <p style={{ padding: "1rem" }}>Chargement…</p>;

  if (error)
    return (
      <div style={{ padding: "1rem" }}>
        <p style={{ color: "red" }}>{error}</p>
        <Link to="/articles" style={{ color: "var(--link-color)" }}>
          ← Retour aux articles
        </Link>
      </div>
    );

  if (!article) return null;

  return (
    <div className="article-detail">
      {/* barre retour */}
      <div className="article-detail__topbar">
        <Link to="/articles" className="article-detail__back">
          ← Retour
        </Link>
      </div>

      {/* image */}
      <div className="article-detail__media">
        <img
          src={article.image_url || FALLBACK_IMG}
          alt={article.title}
          className="article-detail__image"
        />
      </div>

      {/* contenu */}
      <div className="article-detail__body">
        <h1 className="article-detail__title">{article.title}</h1>

        {article.theme ? (
          <span className="article-detail__badge">{article.theme}</span>
        ) : null}

        <div className="article-detail__summary">
          {article.summary ? (
            <p>{article.summary}</p>
          ) : (
            <p style={{ fontStyle: "italic", opacity: 0.6 }}>
              Pas encore de résumé.
            </p>
          )}
        </div>

        <div className="article-detail__actions">
          {article.url ? (
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="article-detail__source-btn"
            >
              Voir la source
            </a>
          ) : (
            <span style={{ opacity: 0.6 }}>Aucun lien source</span>
          )}
        </div>
      </div>
    </div>
  );
}
