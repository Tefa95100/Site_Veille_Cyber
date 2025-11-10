import React from "react";
import { useNavigate } from "react-router-dom";
import "./ArticleCard.css";

const FALLBACK_IMG =
  "/public/images/Bob.jpg";

export default function ArticleCard({ article }) {
	const navigate = useNavigate();
  const {
	id,
    title,
    theme,
    summary,
    image_url,
    url,
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
