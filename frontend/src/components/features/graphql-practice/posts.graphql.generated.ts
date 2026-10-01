import * as Types from '@/lib/graphql/studyApiGeneratedTypes';

export type GetStudyPostsQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetStudyPostsQuery = { posts: Array<{ id: string, title?: string | null, body?: string | null, createdAt: any, user: { id: string, displayName: string } }> };

export type CreateStudyPostMutationVariables = Types.Exact<{
  userId: Types.Scalars['ID']['input'];
  title: Types.Scalars['String']['input'];
  body: Types.Scalars['String']['input'];
}>;


export type CreateStudyPostMutation = { createPost?: { errors: Array<string>, post?: { id: string, title?: string | null, body?: string | null, createdAt: any, user: { id: string, displayName: string } } | null } | null };
