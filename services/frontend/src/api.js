const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
export { API_BASE_URL };

async function handleResponse(res) {
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const err = new Error(data?.message || "Erreur réseau");
    err.status = res.status;
    err.code = data?.code;
    err.extra = data?.extra;
    throw err;
  }

  return data;
}

export async function listArticles({ page = 1, themes = [], page_size, token } = {}) {
  const url = new URL(`${API_BASE_URL}/articles/`);

  if (page) {
    url.searchParams.set("page", page);
  }

  if (page_size) {
    url.searchParams.set("page_size", page_size);
  }

  if (Array.isArray(themes)) {
    themes.forEach(t => url.searchParams.append("theme", t));
  } else if (themes) {
    url.searchParams.append("theme", themes);
  }

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url.toString(), { headers });
  const data = await handleResponse(res);

  return data
}


export async function getArticle(id) {
  const res = await fetch(`${API_BASE_URL}/articles/${id}/`);
  return handleResponse(res);
}

export async function createArticle(payload) {
  const res = await fetch(`${API_BASE_URL}/articles/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateArticle(id, payload) {
  const res = await fetch(`${API_BASE_URL}/articles/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteArticle(id) {
  const res = await fetch(`${API_BASE_URL}/articles/${id}/`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = new Error("Suppression impossible");
    err.status = res.status;
    throw err;
  }
}

async function apiFetch(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : null;

  if (!res.ok) {
    let message = "Erreur API";
    if (data?.detail) {
      message = data.detail;
    } else if (typeof data === "object" && data !== null) {
      const firstKey = Object.keys(data)[0];
      if (firstKey) {
        const v = data[firstKey];
        if (Array.isArray(v)) {
          message = v[0];
        } else if (typeof v === "string") {
          message = v;
        }
      }
    }
    throw new Error(message);
  }

  return data;
}


export async function authLogin(username, password) {
  return apiFetch("/auth/login/", {
    method: "POST",
    body: { username, password },
  });
}

export async function authRegister({ username, email, password, themes }) {
  return apiFetch("/auth/register/", {
    method: "POST",
    body: { username, email, password, themes },
  });
}

export async function authMe(token) {
  return apiFetch("/auth/me/", {
    token,
  });
}

export async function authUpdateMe(token, payload) {
  return apiFetch("/auth/me/", {
    method: "PUT",
    token,
    body: payload,
  });
}

export async function authChangePassword(token, payload) {
  return apiFetch("/auth/change-password/", {
    method: "POST",
    token,
    body: payload,
  });
}

export function favoritesToggle(token, { model, object_id }) {
  return apiFetch("/favorites/toggle/", {
    method: "POST",
    token,
    body: { model, object_id },
  });
}

export function favoritesMine(token) {
  return apiFetch("/favorites/mine/", { token });
}

export function listBestPractices({ token, page = 1, page_size } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (page_size) params.set("page_size", page_size);
  return apiFetch(`/best-practices/?${params.toString()}`, { token });
}

export function getBestPractice(id, token) {
  return apiFetch(`/best-practices/${id}/`, { token });
}

export { apiFetch };
