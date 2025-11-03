const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function handleResponse(res) {
  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    data = null;
  }

  if (!res.ok) {
    const err = new Error(data?.message || "Request failed");
    err.status = res.status;
    err.code = data?.code;
    err.extra = data?.extra;
    throw err;
  }

  return data;
}

// LIST with optional query params (page, theme…)
export async function fetchArticles({ page = 1, theme = [] } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  // multi-theme support ?theme=x&theme=y
  if (Array.isArray(theme)) {
    theme.forEach(t => params.append("theme", t));
  } else if (theme) {
    params.append("theme", theme);
  }

  const res = await fetch(`${API_BASE_URL}/api/articles/?${params.toString()}`, {
    method: "GET",
  });
  return handleResponse(res); // paginated response {count, next, previous, results: [...]}
}

export async function fetchArticle(id) {
  const res = await fetch(`${API_BASE_URL}/api/articles/${id}/`, {
    method: "GET",
  });
  return handleResponse(res); // {id, title, url, theme}
}

export async function createArticle(payload) {
  const res = await fetch(`${API_BASE_URL}/api/articles/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res); // {id, title, url, theme}
}

export async function updateArticle(id, patchPayload) {
  const res = await fetch(`${API_BASE_URL}/api/articles/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patchPayload),
  });
  return handleResponse(res); // {id, title, url, theme}
}

export async function deleteArticle(id) {
  const res = await fetch(`${API_BASE_URL}/api/articles/${id}/`, {
    method: "DELETE",
  });

  if (!res.ok) {
    let data = null;
    try {
      data = await res.json();
    } catch (_) {
        data = null;
      }
    const err = new Error(data?.message || "Delete failed");
    err.status = res.status;
    err.code = data?.code;
    throw err;
  }
}
