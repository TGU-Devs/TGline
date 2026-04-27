export type Club = {
    slug: string;
    name: string;
    category: string;
    categoryIcon: React.ComponentType<{ size?: number }>;
    status: string;
    tags: string[];
    shortDescription: string;
    longDescription: string;
    members: number | string;
    location: string;
    schedule: string;
    costs: string;
    GenderRatio: { male: number; female: number };
    imgUrl: string[];
    color: string;
    contact?: contactInfo;
};

type contactInfo = {
    instagram?: {
        username: string;
        url: string;
    };
    twitter?: {
        username: string;
        url: string;
    };
    facebook?: {
        username: string;
        url: string;
    };
    email?: string;
    website?: string;
};
