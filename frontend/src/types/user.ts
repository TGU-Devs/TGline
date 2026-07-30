export type User = {
    id: number;
    display_name: string;
    email: string;
    description?: string;
    provider: string | null;
    role: string;
}