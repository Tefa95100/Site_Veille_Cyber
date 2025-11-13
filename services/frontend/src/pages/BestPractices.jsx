import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { listBestPractices } from "../api.js";
import { Link } from "react-router-dom";
import FavoriteButton from "../components/FavoriteButton.jsx";
import "../components/ArticleCard.css";

const FALLBACK = "/images/Bob.jpg";

export default function BestPractices() {
  const { user, access } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await listBestPractices({
          token: access || undefined,
          page: 1,
          page_size: 25,
        });
        const list = Array.isArray(data) ? data : data.results || [];
        if (!cancel) setItems(list);
      } catch (e) {
        if (!cancel) setErr(e.message || "Impossible de charger les bonnes pratiques");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [access]);

  if (loading) return <div style={{ padding: "1rem" }}>Chargement…</div>;
  if (err) return <div style={{ padding: "1rem", color: "red" }}>{err}</div>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Bonnes pratiques</h1>

      {items.length === 0 ? (
        <p>Aucune bonne pratique pour le moment.</p>
      ) : (
        <div className="articles-grid">
          {items.map((bp) => {
            const imgSrc = bp.image || FALLBACK;
            return (
              <Link
                key={bp.id}
                to={`/best-practices/${bp.id}`}
                className="article-card"
                style={{ textDecoration: "none" }}
              >
                <div className="article-card__image-wrapper">
                  <img
                    src={imgSrc}
                    alt={bp.title}
                    className="article-card__image"
                    loading="lazy"
                  />
                  {user && (
                    <div
                      className="article-card__fav-float"
                      onClick={(e) => e.preventDefault()}
                    >
                      <FavoriteButton
                        model="bestpractice"
                        objectId={bp.id}
                        initial={!!bp.is_favorite}
                      />
                    </div>
                  )}
                </div>

                <div className="article-card__content">
                  <h3 className="article-card__title">{bp.title}</h3>
                  <p className="article-card__summary">
                    {bp.content?.length > 140
                      ? bp.content.slice(0, 140) + "…"
                      : bp.content}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
