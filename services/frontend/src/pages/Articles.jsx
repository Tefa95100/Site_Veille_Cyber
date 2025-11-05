import React, { useEffect, useState } from "react";
import { listArticles } from "../api.js";
import ArticleCard from "../components/ArticleCard.jsx";

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  async function loadPage(p = 1) {
    try {
      setLoading(true);
      setError(null);
      const data = await listArticles({ page: p, page_size: 25 });
      const list = Array.isArray(data) ? data : data.results || [];
      setArticles(list);

      if (!Array.isArray(data)) {
        setHasNext(!!data.next);
        setHasPrev(!!data.previous);
      } else {
        setHasNext(list.length === 25);
        setHasPrev(p > 1);
      }

      setPage(p);
    } catch (err) {
      setError(err.message || "Impossible de charger les articles");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage(1);
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Tous les articles</h1>
      {loading ? (
        <p>Chargement…</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <>
          <div className="articles-grid">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
          <div className="pagination" style={{ marginTop: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
            <button onClick={() => loadPage(page - 1)} disabled={!hasPrev}>
              ← Précédent
            </button>
            <span>Page {page}</span>
            <button onClick={() => loadPage(page + 1)} disabled={!hasNext}>
              Suivant →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
