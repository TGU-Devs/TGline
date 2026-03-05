export type ExternalSite = {
    url: string;
    icon: React.ComponentType<{ size?: number }>;
    category: string;
    title: string;
    description: string;
    iconClass: string;
};
