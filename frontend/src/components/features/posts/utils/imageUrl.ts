import { apiUrl } from "@/lib/api";

export const getPostImageUrl = (url: string) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    return apiUrl(url);
};
