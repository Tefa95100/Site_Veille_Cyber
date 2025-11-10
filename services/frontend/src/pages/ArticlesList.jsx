import { useEffect, useState } from "react";
import { fetchArticles, deleteArticle } from "../api/articles.js";
import { Link, useNavigate } from "react-router-dom";

export default function ArticlesList() {
  const [data, setData] = useState(null); // {count, next, previous, results: [...]}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  async function load(pageToLoad = 1) {
    try {
      setLoading(true);
      setError("");
      const res = await fetchArticles({ page: pageToLoad });
      setData(res);
      setPage(pageToLoad);
    } catch (err) {
      setError(err.message || "Erreur chargement des articles");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
  }, []);

  async function handleDelete(id) {
    if (!confirm("Supprimer cet article ?")) return;
    try {
      await deleteArticle(id);
      load(page);
    } catch (err) {
      alert(`Suppression impossible: ${err.message || err.code || "erreur inconnue"}`);
    }
  }

  if (loading) return <p>Chargement…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data) return <p>Aucune donnée</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Articles</h1>
        <button onClick={() => navigate("/articles/new")}>
          + Nouvel article
        </button>
      </header>

      <table border="1" cellPadding="8" style={{ width: "100%", marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Titre</th>
            <th>Thème</th>
            <th>URL</th>
            <th style={{ width: "200px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.results.map(article => (
            <tr key={article.id}>
              <td>{article.title}</td>
              <td>{article.theme || <i style={{color:"#666"}}>—</i>}</td>
              <td>
                <a href={article.url} target="_blank" rel="noreferrer">
                  {article.url}
                </a>
              </td>
              <td style={{ display: "flex", gap: "0.5rem" }}>
                <Link to={`/articles/${article.id}`}>Voir</Link>
                <Link to={`/articles/${article.id}/edit`}>Modifier</Link>
                <button onClick={() => handleDelete(article.id)}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination basique */}
      <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
        <button
          disabled={!data.previous}
          onClick={() => load(page - 1)}
        >
          ← Précédent
        </button>

        <span>Page {page}</span>

        <button
          disabled={!data.next}
          onClick={() => load(page + 1)}
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
