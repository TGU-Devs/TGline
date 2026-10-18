const API_BASE_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/+$/, "");

export const apiUrl = (path: string) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
};

const ACCESS_TOKEN_EXPIRED = "token_expired";
let refreshPromise: Promise<boolean> | null = null;

const isAccessTokenExpired = async (response: Response) => {
    if (response.status !== 401) return false;

    try {
        const body = await response.clone().json();
        return body.error === ACCESS_TOKEN_EXPIRED;
    } catch {
        return false;
    }
};

const requestTokenRefresh = async () => {
    const response = await fetch(apiUrl("/api/users/refresh"), {
        method: "POST",
        credentials: "include",
    });

    if (response.status === 401 && typeof window !== "undefined") {
        window.location.replace("/login?status=session_expired");
    }

    return response.ok;
};

const refreshAccessToken = () => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = requestTokenRefresh().finally(() => {
        refreshPromise = null;
    });

    return refreshPromise;
};

export const apiFetch = async (path: string, init: RequestInit = {}) => {
    const requestInit = {
        ...init,
        credentials: init.credentials ?? "include",
    };
    const response = await fetch(apiUrl(path), requestInit);

    if (!(await isAccessTokenExpired(response))) return response;

    const refreshed = await refreshAccessToken();
    if (!refreshed) return response;

    return fetch(apiUrl(path), requestInit);
};
