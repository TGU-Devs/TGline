import "server-only";

import { gql } from "@apollo/client";

import { getStudyApiClient } from "@/lib/graphql/apolloClient";

import type {
    CreateStudyPostMutation,
    CreateStudyPostMutationVariables,
    GetStudyPostsQuery,
    GetStudyPostsQueryVariables,
} from "./posts.graphql.generated";

const getStudyPostsGql = gql`
    query GetStudyPosts($limit: Int = 20) {
        posts(limit: $limit) {
            id
            title
            body
            createdAt
            user {
                id
                displayName
            }
        }
    }
`;

const createStudyPostGql = gql`
    mutation CreateStudyPost($userId: ID!, $title: String!, $body: String!) {
        createPost(input: { userId: $userId, title: $title, body: $body }) {
            post {
                id
                title
                body
                createdAt
                user {
                    id
                    displayName
                }
            }
            errors
        }
    }
`;

export const getStudyPosts = async (
    variables: GetStudyPostsQueryVariables = {},
) => {
    const { data } = await getStudyApiClient().query<
        GetStudyPostsQuery,
        GetStudyPostsQueryVariables
    >({
        query: getStudyPostsGql,
        variables,
        fetchPolicy: "no-cache",
    });

    if (!data) {
        throw new Error("GetStudyPosts query returned no data");
    }

    return data.posts;
};

export const createStudyPost = async (
    variables: CreateStudyPostMutationVariables,
) => {
    const { data } = await getStudyApiClient().mutate<
        CreateStudyPostMutation,
        CreateStudyPostMutationVariables
    >({
        mutation: createStudyPostGql,
        variables,
    });

    if (!data) {
        throw new Error("CreatePost mutation returned no data");
    }

    return data.createPost;
};
