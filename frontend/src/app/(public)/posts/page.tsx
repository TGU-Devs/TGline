"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Trash } from "lucide-react";

import { useStatusToast } from "@/hooks/useStatusToast";
import Loading from "@/components/ui/Loading";
import ErrorUI from "@/components/ui/ErrorUI";
import Toast from "@/components/ui/Toast";
import PostsHeader from "@/components/features/posts/components/list/PostsHeader";
import TagFilter from "@/components/features/posts/components/list/TagFilter";
import EnptyState from "@/components/features/posts/components/list/EnptyState";
import PostList from "@/components/features/posts/components/list/PostList";
import LoginPromptModal from "@/components/features/auth/LoginPromptModal";

import type { Post, Tag } from "../../../components/features/posts/types";

export default function PostsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(() => {
    const tagId = searchParams.get("tag_id");
    return tagId ? Number(tagId) : null;
  });

  const { showToast, message } = useStatusToast(
     "/posts",
     {
       deleted: { message: "投稿が削除されました。" },
     }
   );

  const fetchTags = async () => {
    try {
      const res = await fetch("/api/tags", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    } catch {
      // タグ取得失敗は無視
    }
  };

  const fetchPosts = useCallback(async (targetPage: number = 1) => {
    try {
      if (targetPage === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      // フロント側でクエリパラメーターを作成してapiに渡す
      const params = new URLSearchParams();
      if (selectedTagId !== null) {
        params.set("tag_id", String(selectedTagId));
      }
      params.set("page", String(targetPage));
      const url = `/api/posts?${params.toString()}`;
      // バックエンドにリクエスト(今の場合route handlerを仲介させている)
      const res = await fetch(url, { credentials: "include" });

      if (!res.ok) {
        throw new Error("投稿の取得に失敗しました");
      }

      const data = await res.json();
      if (targetPage === 1) {
        setPosts(data.posts);
      } else {
        setPosts((prev: Post[]) => [...prev, ...data.posts]);
      }
      setHasMore(data.has_next);
      setPage(targetPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [selectedTagId]);

  useEffect(() => {
    fetch("/api/users/me", { credentials: "include" })
      .then((res) => setIsAuthenticated(res.ok))
      .catch(() => setIsAuthenticated(false));
  }, []);

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // 選択中のタグを取得
  const selectedTag = tags.find((t) => t.id === selectedTagId);

  const groupedTags = tags.reduce<Record<string, Tag[]>>((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = [];
    acc[tag.category].push(tag);
    return acc;
  }, {});

   const handleTagSelect = useCallback((tagId: number | null) => {
    setSelectedTagId(tagId);
    setPage(1);
    setHasMore(true);
    const params = new URLSearchParams(searchParams.toString());
    if (tagId !== null) {
      params.set("tag_id", String(tagId));
    } else {
      params.delete("tag_id");
    }
    router.replace(`/posts?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const handleLikeToggle = async (e: React.MouseEvent, postId: number, currentLiked: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    // 未ログインならモーダル表示
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const rollbackLike = () => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                current_user_liked: currentLiked,
                likes_count: currentLiked ? p.likes_count + 1 : p.likes_count - 1,
              }
            : p
        )
      );
    };

    // 楽観的 UI 更新
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              current_user_liked: !currentLiked,
              likes_count: currentLiked ? p.likes_count - 1 : p.likes_count + 1,
            }
          : p
      )
    );

    try {
      const res = await fetch(`/api/posts/${postId}/likes`, {
        method: currentLiked ? "DELETE" : "POST",
        credentials: "include",
      });

      // 401: トークン期限切れ → モーダル表示
      if (res.status === 401) {
        setIsAuthenticated(false);
        setShowLoginModal(true);
        rollbackLike();
        return;
      }

      if (!res.ok && res.status !== 201 && res.status !== 204) {
        rollbackLike();
      }
    } catch {
      rollbackLike();
    }
  };

  if (isLoading) {
    return (
      <Loading />
    );
  }

  if (error) {
    return (
      <ErrorUI error={error} fetch={() => {setError(null); fetchPosts(1);} } />
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8">
      <Toast showToast={showToast} icon={Trash} message={message} bg="bg-red-500" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <PostsHeader
          isAuthenticated={!!isAuthenticated}
          setShowLoginModal={setShowLoginModal}
          searchParams={searchParams}
        />

        <TagFilter
          groupedTags={groupedTags}
          selectedTag={selectedTag}
          selectedTagId={selectedTagId}
          onTagSelect={handleTagSelect}
        />


        {/* 投稿一覧 */}
        {posts.length === 0 ? (
          <EnptyState
            isAuthenticated={!!isAuthenticated}
            searchParams={searchParams}
            setShowLoginModal={setShowLoginModal}
          />
        ) : (
          <PostList
            posts={posts}
            isAuthenticated={!!isAuthenticated}
            handleLikeToggle={handleLikeToggle}
            searchParams={searchParams}
            setShowLoginModal={setShowLoginModal}
            hasMore={hasMore}
            fetchPosts={fetchPosts}
            page={page}
            isLoadingMore={isLoadingMore}
          />
        )}
      </div>
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
