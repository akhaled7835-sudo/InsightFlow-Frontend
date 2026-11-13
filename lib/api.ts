export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://insightflow.runasp.net";

export const TOKEN_KEY = "insightflow_token";
export const SESSION_KEY = "insightflow_session";
export const LANG_KEY = "insightflow_lang";

export interface AuthSession {
  token: string;
  userId?: string;
  email?: string;
  fullName?: string;
  isDemo?: boolean;
  workspaceId?: string;
  defaultProjectId?: string;
  expiresAtUtc?: string;
}

export function getLang(): string {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem(LANG_KEY) || "en";
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  const lang = getLang();

  const headers = new Headers(options.headers || {});
  headers.set("Accept-Language", lang);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && typeof window !== "undefined" && !path.includes("/auth/")) {
    clearSession();
    window.location.href = "/login";
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      data?.detail ||
      data?.message ||
      data?.title ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;
    throw new ApiError(msg, res.status);
  }

  return data as T;
}
