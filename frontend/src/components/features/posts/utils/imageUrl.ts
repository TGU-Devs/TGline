export const getPostImageUrl = (url: string) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    return apiUrl ? `${apiUrl.replace(/\/$/, "")}${url}` : url;
};
