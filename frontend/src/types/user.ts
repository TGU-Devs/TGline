export type User = {
    display_name: string;
    email: string;
    description?: string;
    provider: string | null;
    role: string;
}