const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export { API_BASE_URL };

async function handleResponse(res) {
  // essaie de parser le JSON (même en cas d'erreur)
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    // On normalise une erreur exploitable par l'UI
    const err = new Error(data?.message || "Erreur réseau");
    err.status = res.status;
    err.code = data?.code;
    err.extra = data?.extra;
    throw err;
  }

  return data;
}

export async function listArticles({ page = 1, themes = [] } = {}) {
  const url = new URL(`${API_BASE_URL}/api/articles/`);

  if (page) {
    url.searchParams.set("page", page);
  }

  if (Array.isArray(themes)) {
    themes.forEach(t => url.searchParams.append("theme", t));
  } else if (themes) {
    url.searchParams.append("theme", themes);
  }

  const res = await fetch(url.toString());
  const data = await handleResponse(res);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  return [];
}


export async function getArticle(id) {
  const res = await fetch(`${API_BASE_URL}/api/articles/${id}/`);
  return handleResponse(res);
}

export async function createArticle(payload) {
  const res = await fetch(`${API_BASE_URL}/api/articles/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateArticle(id, payload) {
  const res = await fetch(`${API_BASE_URL}/api/articles/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteArticle(id) {
  const res = await fetch(`${API_BASE_URL}/api/articles/${id}/`, {
    method: "DELETE",
  });
  if (!res.ok) {
    // DELETE 204 -> pas de body
    const err = new Error("Suppression impossible");
    err.status = res.status;
    throw err;
  }
}
