const API_BASE_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/+$/, "");

export const apiUrl = (path: string) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
};

export const apiFetch = (path: string, init: RequestInit = {}) => {
    return fetch(apiUrl(path), {
        ...init,
        credentials: init.credentials ?? "include",
    });
};
