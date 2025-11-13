import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getBestPractice } from "../api";
import FavoriteButton from "../components/FavoriteButton.jsx";
import "../index.css";

const FALLBACK = "/images/Bob.jpg";

export default function BestPracticeDetail() {
  const { id } = useParams();
  const { user, access } = useAuth();
  const [bp, setBp] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getBestPractice(id, access || undefined);
        if (!cancel) setBp(data);
      } catch (e) {
        if (!cancel) setErr(e.message || "Impossible de charger la bonne pratique");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [id, access]);

  if (loading) return <div style={{ padding: "1rem" }}>Chargement…</div>;
  if (err) return <div style={{ padding: "1rem", color: "red" }}>{err}</div>;
  if (!bp) return null;

  return (
    <div className="article-detail">
      <div className="article-detail__topbar">
        <Link to="/best-practices" className="article-detail__back">← Retour</Link>
      </div>

      <div className="article-detail__media">
        <img
          src={bp.image || FALLBACK}
          alt={bp.title}
          className="article-detail__image"
          loading="eager"
        />
      </div>

      <div className="article-detail__body">
        <h1 className="article-detail__title">{bp.title}</h1>
        {user && (
          <div style={{ margin: "0.5rem 0" }}>
            <FavoriteButton model="bestpractice" objectId={bp.id} initial={!!bp.is_favorite} />
          </div>
        )}
        <p className="article-detail__summary">{bp.content}</p>
      </div>
    </div>
  );
}
