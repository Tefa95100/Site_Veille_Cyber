import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FavoriteButton from "../components/FavoriteButton";
import "./ArticleCard.css";

const FALLBACK_IMG =
  "/images/Bob.jpg";

export default function ArticleCard({ article }) {
	const navigate = useNavigate();
  const { user } = useAuth();
  const {
	id,
    title,
    theme,
    summary,
    image_url,
    url,
    is_favorite,
  } = article;

  const handleCardClick = () => {
    if (!id) return;
    navigate(`/articles/${id}`);
  };

  const handleSourceClick = (e) => {
    e.stopPropagation();
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="article-card" onClick={handleCardClick} role="button">

      <div className="article-card__image-wrapper">
        <img
          src={image_url || FALLBACK_IMG}
          alt={title}
          className="article-card__image"
          loading="lazy"
        />

        {user && (
          <div className="article-card__fav-float" onClick={(e) => e.stopPropagation()}>
            <FavoriteButton
              model="article"
              objectId={id}
              initial={is_favorite}
            />
          </div>
        )}
        
      </div>

      <div className="article-card__content">
        <h3 className="article-card__title">{title}</h3>
        {theme ? <span className="article-card__theme">{theme}</span> : null}
        {summary ? (
          <p className="article-card__summary">
            {summary.length > 120 ? summary.slice(0, 120) + "..." : summary}
          </p>
        ) : (
          <p className="article-card__summary article-card__summary--empty">
            Pas de résumé disponible...
          </p>
        )}
      </div>
      <button className="article-card__source" onClick={handleSourceClick}>
        source
      </button>
    </div>
  );
}
