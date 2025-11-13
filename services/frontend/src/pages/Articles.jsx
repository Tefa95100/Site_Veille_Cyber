import React, { useEffect, useState, useCallback } from "react";
import { listArticles } from "../api.js";
import ArticleCard from "../components/ArticleCard.jsx";
import Articles_Filter from "../components/Articles_Filter.jsx";
import { useAuth } from "../context/AuthContext";
import { onFavoriteChange } from "../favorite-events";

const PAGE_SIZE = 25;

function sortByNewest(a, b) {
  const aPub = a.publish_date ? new Date(a.publish_date) : null;
  const bPub = b.publish_date ? new Date(b.publish_date) : null;

  if (aPub && bPub) {
    if (bPub.getTime() !== aPub.getTime()) {
      return bPub - aPub;
    }
  } else if (aPub && !bPub) {
    return -1;
  } else if (!aPub && bPub) {
    return 1;
  }

  const aCreated = a.created_at ? new Date(a.created_at) : null;
  const bCreated = b.created_at ? new Date(b.created_at) : null;

  if (aCreated && bCreated) {
    if (bCreated.getTime() !== aCreated.getTime()) {
      return bCreated - aCreated;
    }
  } else if (aCreated && !bCreated) {
    return -1;
  } else if (!aCreated && bCreated) {
    return 1;
  }

  const aId = typeof a.id === "number" ? a.id : 0;
  const bId = typeof b.id === "number" ? b.id : 0;
  return bId - aId;
}


export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalCount, setTotalCount] = useState(null);

  const [selectedTheme, setSelectedTheme] = useState("");
  const [onlyInterests, setOnlyInterests] = useState(false);

  const [allArticles, setAllArticles] = useState(null);
  const [allInterestArticles, setAllInterestArticles] = useState(null);
  const [filteredPage, setFilteredPage] = useState(1);
  const [loadingAll, setLoadingAll] = useState(false);

  const { user, access } = useAuth();


  const loadPage = useCallback(
    async (p = 1) => {
      try {
        setLoading(true);
        setError(null);

        const data = await listArticles({
          page: p,
          page_size: PAGE_SIZE,
        });
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
    },
    []
  );

  useEffect(() => {
    const off = onFavoriteChange(({ model, objectId, favorited }) => {
      if (model !== "article") return;
      setArticles(prev => prev.map(a => a.id === objectId ? { ...a, is_favorite: favorited } : a));
      setAllArticles(prev => prev ? prev.map(a => a.id === objectId ? { ...a, is_favorite: favorited } : a) : prev);
      setAllInterestArticles(prev => prev ? prev.map(a => a.id === objectId ? { ...a, is_favorite: favorited } : a) : prev);
    });
    return off;
  }, []);

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  const loadAllPublicArticles = useCallback(async () => {
    setLoadingAll(true);
    let p = 1;
    const merged = [];

    const firstData = await listArticles({
      page: p,
      page_size: PAGE_SIZE,
  });
    const firstList = Array.isArray(firstData) ? firstData : firstData.results || [];
    merged.push(...firstList);

    let hasNextPage = !Array.isArray(firstData) && !!firstData.next;

    while (hasNextPage) {
      p += 1;
      const data = await listArticles({
        page: p,
        page_size: PAGE_SIZE,
      });
      const list = Array.isArray(data) ? data : data.results || [];
      merged.push(...list);

      hasNextPage = !Array.isArray(data) && !!data.next;
    }

    setLoadingAll(false);
    setAllArticles(merged);
    return merged;
  }, []);

  const loadAllInterestArticles = useCallback(async () => {
    if (!user) return [];
    setLoadingAll(true);
    let p = 1;
    const merged = [];

    const firstData = await listArticles({
      page: p,
      page_size: PAGE_SIZE,
      token: access,
    });
    const firstList = Array.isArray(firstData)
      ? firstData
      : firstData.results || [];
    merged.push(...firstList);

    let hasNextPage = !Array.isArray(firstData) && !!firstData.next;

    while (hasNextPage) {
      p += 1;
      const data = await listArticles({
        page: p,
        page_size: PAGE_SIZE,
        token: access,
      });
      const list = Array.isArray(data) ? data : data.results || [];
      merged.push(...list);

      hasNextPage = !Array.isArray(data) && !!data.next;
    }

    setLoadingAll(false);
    setAllInterestArticles(merged);
    return merged;
  }, [user, access]);

  useEffect(() => {
    const isFiltering = selectedTheme !== "" || onlyInterests;

    if (!isFiltering) {
      setAllArticles(null);
      setAllInterestArticles(null);
      setFilteredPage(1);
      loadPage(1);
      return;
    }

    (async () => {
      const publicBase =
        allArticles || (await loadAllPublicArticles());

      let interestBase = [];
      if (onlyInterests && user) {
        interestBase =
          allInterestArticles || (await loadAllInterestArticles());
      }

      let finalList = [];

      if (onlyInterests && selectedTheme) {
        const themePart = publicBase.filter(
          (a) =>
            a.theme &&
            a.theme.toString().trim().toLowerCase() ===
            selectedTheme.toString().trim().toLowerCase()
        );
        const interestPart = interestBase;

        const map = new Map();
        themePart.forEach((a) => map.set(a.id, a));
        interestPart.forEach((a) => {
          if (!map.has(a.id)) {
            map.set(a.id, a);
          }
        });

        let finalListLocal = Array.from(map.values());
        finalListLocal.sort(sortByNewest);
        finalList = finalListLocal;
      } else if (onlyInterests) {
        finalList = interestBase;
      } else if (selectedTheme) {
        finalList = publicBase.filter((a) => a.theme === selectedTheme);
      }

      if (finalList && finalList.length) {
        finalList.sort(sortByNewest);
      }

      setFilteredPage(1);
      setArticles(finalList);
      setTotalCount(finalList.length);
    })();
  }, [selectedTheme,
    onlyInterests,
    access,
    user,
    allArticles,
    allInterestArticles,
    loadAllPublicArticles,
    loadAllInterestArticles,
    loadPage,
  ]);

  const isFiltering = selectedTheme !== "" || onlyInterests;
  let paginatedArticles = articles;
  let filteredTotalPages = 1;

  if (isFiltering) {
    filteredTotalPages = Math.ceil((articles?.length || 0) / PAGE_SIZE) || 1;
    const start = (filteredPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    paginatedArticles = articles.slice(start, end);
  }

  return (
    <div style={{ padding: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h1 className="text-2xl font-bold">Tous les articles</h1>
        <Articles_Filter
          selectedTheme={selectedTheme}
          onThemeChange={(t) => {
            setSelectedTheme(t);
          }}
          onlyInterests={onlyInterests}
          onOnlyInterestsChange={(c) => {
            if (!user) {
              setOnlyInterests(false);
              return;
            }
            setOnlyInterests(c);
          }}
          isAuthenticated={!!user}
        />
      </div>

      {loading ? (
        <p>Chargement…</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <>
          {loadingAll && (
            <p style={{ marginBottom: "0.5rem" }}>
              Chargement de tous les articles pour le filtrage…
            </p>
          )}

          <div className="articles-grid">
            {paginatedArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>

          {!isFiltering && totalCount > PAGE_SIZE && (
            <div
              className="pagination-bar"
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
                >
                  {Array.from({
                    length: Math.ceil(totalCount / PAGE_SIZE),
                  }).map((_, i) => (
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

          {isFiltering && articles.length > PAGE_SIZE && (
            <div
              className="pagination-bar"
              style={{
                marginTop: "1.5rem",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div className="join">
                <button
                  className="join-item btn"
                  onClick={() => setFilteredPage((p) => Math.max(1, p - 1))}
                  disabled={filteredPage === 1}
                >
                  «
                </button>
                <select
                  className="join-item btn"
                  value={filteredPage}
                  onChange={(e) => setFilteredPage(Number(e.target.value))}
                >
                  {Array.from({ length: filteredTotalPages }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Page {i + 1}
                    </option>
                  ))}
                </select>
                <button
                  className="join-item btn"
                  onClick={() =>
                    setFilteredPage((p) =>
                      Math.min(filteredTotalPages, p + 1)
                    )
                  }
                  disabled={filteredPage === filteredTotalPages}
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
