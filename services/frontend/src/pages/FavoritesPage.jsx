import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { favoritesMine } from "../api";

export default function FavoritesPage() {
  const { access, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancel = false;
    async function run() {
      if (!user || !access) { setItems([]); setLoading(false); return; }
      try {
        setLoading(true);
        const data = await favoritesMine(access);
        if (!cancel) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancel) setErr(e.message || "Impossible de charger vos favoris");
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    run();
    return () => { cancel = true; };
  }, [user, access]);

  if (!user) return <div style={{padding:"1rem"}}>Connecte-toi pour voir tes favoris.</div>;
  if (loading) return <div style={{padding:"1rem"}}>Chargement…</div>;
  if (err) return <div style={{padding:"1rem", color:"red"}}>{err}</div>;

  if (items.length === 0) {
    return (
      <div style={{padding:"1rem"}}>
        <h1>Mes favoris</h1>
        <p>Aucun favori pour le moment.</p>
      </div>
    );
  }

  return (
    <div style={{padding:"1rem"}}>
      <h1>Mes favoris</h1>
      <div className="articles-grid">
        {items.map(fav => (
          <a
            key={`${fav.model}-${fav.object_id}`}
            href={fav.model === "article" ? `/articles/${fav.object_id}` : `/best-practices`}
            className="article-card"
            style={{ textDecoration: "none" }}
          >
            <div className="article-card__image-wrapper">
              <img
                src={fav.image || "/images/Bob.jpg"}
                alt={fav.title || fav.model}
                className="article-card__image"
                loading="lazy"
              />
            </div>
            <div className="article-card__content">
              <span className="article-card__theme" style={{textTransform:"none"}}>
                {fav.model === "article" ? "Article" : "Bonne pratique"}
              </span>
              <h3 className="article-card__title">{fav.title || "(Sans titre)"}</h3>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
