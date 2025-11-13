import React from "react";
import "./Articles_Filter.css";

const THEMES = [
  { value: "", label: "Tous les thèmes" },
  { value: "security", label: "Securité" },
  { value: "cloud", label: "Cloud" },
  { value: "pentest", label: "Pentest" },
  { value: "ai", label: "Intelligence artificielle" },
  { value: "vulnerability", label: "Vulnérabilités" },
  { value: "other", label: "Autre" },
];

export default function Articles_Filter({
  selectedTheme,
  onThemeChange,
  onlyInterests,
  onOnlyInterestsChange,
  isAuthenticated,
}) {
  return (
    <div className="articles-filter">
      <select
        value={selectedTheme}
        onChange={(e) => onThemeChange(e.target.value)}
        className="articles-filter__select"
      >
        {THEMES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {isAuthenticated && (
		<label className="articles-filter__toggle">
        <input
          type="checkbox"
          checked={onlyInterests}
          onChange={(e) => onOnlyInterestsChange(e.target.checked)}
        />
        <span>Mes centres d’intérêt</span>
      </label>
	  )}
    </div>
  );
}
