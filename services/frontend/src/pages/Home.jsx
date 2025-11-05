import { useEffect, useState } from "react";
import { listArticles } from "../api.js";
import ArticleCard from "../components/ArticleCard.jsx";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    async function load() {
        try {
            setLoading(true);
            setError(null);
            const data = await listArticles();
            const list = Array.isArray(data) ? data : data.results || [];
            setArticles(list.slice(0, 10));
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

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Articles récents</h1>
      {articles.length === 0 ? (
        <p>Aucun article pour le moment.</p>
      ) : (
        <div className="articles-grid">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
