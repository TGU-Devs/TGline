import "server-only";

import { HttpLink, InMemoryCache } from "@apollo/client";
import {
    ApolloClient,
    registerApolloClient,
} from "@apollo/client-integration-nextjs";

const API_BASE_URL = (
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
).replace(/\/+$/, "");
const STUDY_API_URL =
    process.env.STUDY_API_URL ?? `${API_BASE_URL}/study_api/graphql`;

export const { getClient: getStudyApiClient } = registerApolloClient(
    () =>
        new ApolloClient({
            cache: new InMemoryCache(),
            link: new HttpLink({
                uri: STUDY_API_URL,
                fetchOptions: { cache: "no-store" },
            }),
        }),
);
