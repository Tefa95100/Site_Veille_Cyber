import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { favoritesToggle } from "../api";
import { emitFavoriteChange } from "../favorite-events";
import "./FavoriteButton.css";

export default function FavoriteButton({ model, objectId, initial = false }) {
  const { access } = useAuth();
  const [isFav, setIsFav] = useState(!!initial);
  const [loading, setLoading] = useState(false);

  async function toggle(e) {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      const { favorited } = await favoritesToggle(access, { model, object_id: objectId });
      const next = !!favorited;
      setIsFav(next);
      emitFavoriteChange({ model, objectId, favorited: next });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className={`fav-icon ${isFav ? "active" : ""}`}
      aria-pressed={isFav}
      aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
      onClick={toggle}
      disabled={loading}
    >
      <svg className="heart heart-full" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.1 21.35l-1.1-.98C5.14 15.24 2 12.36 2 8.98 2 6.41 4.02 4.5 6.6 4.5c1.54 0 3.04.7 4 1.81.96-1.11 2.46-1.81 4-1.81 2.58 0 4.6 1.91 4.6 4.48 0 3.38-3.14 6.26-8.99 11.39l-1.11.98z"/>
      </svg>
      <svg className="heart heart-outline" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16.6 4.5c-1.54 0-3.04.7-4 1.81-.96-1.11-2.46-1.81-4-1.81C6.02 4.5 4 6.41 4 8.98c0 3.38 3.14 6.26 8.99 11.39L14.1 21.35C19.96 16.22 23.1 13.34 23.1 9.96 23.1 7.39 21.08 5.48 18.5 5.48c-1.12 0-2.2.41-2.99 1.12-.79-.71-1.87-1.12-2.99-1.12z"/>
      </svg>
    </button>
  );
}
