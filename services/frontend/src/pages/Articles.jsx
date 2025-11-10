import React, { useEffect, useState } from "react";
import { listArticles } from "../api.js";
import ArticleCard from "../components/ArticleCard.jsx";

const PAGE_SIZE = 25;

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalCount, setTotalCount] = useState(null);

  async function loadPage(p = 1) {
    try {
      setLoading(true);
      setError(null);

      const data = await listArticles({ page: p, page_size: PAGE_SIZE });
      console.log(data);

      const list = Array.isArray(data) ? data : data.results || [];
      setArticles(list);

      if (!Array.isArray(data)) {
        setHasNext(!!data.next);
        setHasPrev(!!data.previous);
        setTotalCount(data.count);
      } else {
        setHasNext(list.length === PAGE_SIZE);
        setHasPrev(p > 1);
        setTotalCount(null);
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

  const totalPages = totalCount ? Math.ceil(totalCount / PAGE_SIZE) : 1;

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

          {totalPages > 1 && (
            <div className="pagination-bar"
              style={{
                marginTop: "1.5rem",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div className="join">
                <button
                  className="join-item btn"
                  onClick={() => loadPage(page - 1)}
                  disabled={!hasPrev}
                >
                  «
                </button>

                <select
                    className="join-item btn"
                    value={page}
                    onChange={(e) => loadPage(Number(e.target.value))}
                    style={{
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      paddingRight: "2rem",
                      backgroundPosition: "right 0.5rem center",
                      backgroundRepeat: "no-repeat",
                    }}
                >
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Page {i + 1}
                    </option>
                  ))}
                </select>

                <button
                  className="join-item btn"
                  onClick={() => loadPage(page + 1)}
                  disabled={!hasNext}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}