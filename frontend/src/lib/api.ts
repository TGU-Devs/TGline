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

export class ApiError extends Error {
    readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

export const extractApiError = async (
    res: Response,
    fallback: string,
): Promise<string> => {
    const data = await res.json().catch(() => null);
    return data?.error || data?.errors?.join?.(" / ") || fallback;
};

export const apiJson = async <T>(
    path: string,
    init: RequestInit = {},
    fallbackMessage = "エラーが発生しました",
): Promise<T> => {
    const res = await apiFetch(path, init);

    if (!res.ok) {
        throw new ApiError(await extractApiError(res, fallbackMessage), res.status);
    }

    return (await res.json()) as T;
};
