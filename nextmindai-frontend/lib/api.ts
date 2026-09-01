const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function ensureSlash(path: string): string {
  return path.endsWith("/") ? path : path + "/";
}

function getTokens(): { access: string | null; refresh: string | null } {
  if (typeof window === "undefined") return { access: null, refresh: null };
  return {
    access: localStorage.getItem("access_token"),
    refresh: localStorage.getItem("refresh_token"),
  };
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

async function refreshAccessToken(): Promise<string | null> {
  const { refresh } = getTokens();
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const newAccess = data.data?.access || data.access;
    if (newAccess) {
      localStorage.setItem("access_token", newAccess);
      return newAccess;
    }
    return null;
  } catch {
    return null;
  }
}

interface RequestOptions extends RequestInit {
  json?: unknown;
}

export async function api<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { json, ...fetchOpts } = options;
  const url = `${API_BASE}${ensureSlash(path)}`;

  const headers = new Headers(fetchOpts.headers);
  const { access } = getTokens();
  if (access) {
    headers.set("Authorization", `Bearer ${access}`);
  }
  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
    fetchOpts.body = JSON.stringify(json);
  }
  fetchOpts.headers = headers;

  let res = await fetch(url, fetchOpts);

  if (res.status === 401 && getTokens().refresh) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      headers.set("Authorization", `Bearer ${newAccess}`);
      res = await fetch(url, { ...fetchOpts, headers });
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw { status: res.status, ...error };
  }

  if (res.status === 204) return null as T;
  return res.json();
}

export function apiUpload(path: string, file: File, extra?: Record<string, string>): Promise<unknown> {
  const { access } = getTokens();
  const form = new FormData();
  form.append("file", file);
  form.append("name", file.name);
  if (extra) {
    Object.entries(extra).forEach(([k, v]) => {
      if (v) form.append(k, v);
    });
  }
  return fetch(`${API_BASE}${ensureSlash(path)}`, {
    method: "POST",
    headers: access ? { Authorization: `Bearer ${access}` } : undefined,
    body: form,
  }).then(async (res) => {
    if (!res.ok) throw await res.json();
    return res.json();
  });
}
