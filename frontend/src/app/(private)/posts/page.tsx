"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStatusToast } from "@/hooks/useStatusToast";
import Toast from "@/components/ui/Toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Calendar, User, ChevronDown, X, MessageCircle, Heart, Trash } from "lucide-react";

interface Tag {
  id: number;
  name: string;
  category: "faculty" | "topic";
}

interface Post {
  id: number;
  title: string;
  body: string;
  user: {
    id: number;
    display_name: string;
  } | null;
  tags: Tag[];
  likes_count: number;
  current_user_liked: boolean;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

const CATEGORY_CONFIG = {
  faculty: {
    label: "学部",
    badge: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    badgeActive: "bg-blue-500 text-white border-blue-500",
  },
  topic: {
    label: "トピック",
    badge: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
    badgeActive: "bg-orange-500 text-white border-orange-500",
  },
} as const;

export default function PostsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(() => {
    const tagId = searchParams.get("tag_id");
    return tagId ? Number(tagId) : null;
  });
  const [openCategory, setOpenCategory] = useState<string | null>(null);

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

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      // フロント側でクエリパラメーターを作成してapiに渡す
      const params = new URLSearchParams();
      if (selectedTagId !== null) {
        params.set("tag_id", String(selectedTagId));
      }
      const query = params.toString();
      const url = query ? `/api/posts?${query}` : "/api/posts";
      // バックエンドにリクエスト(今の場合route handlerを仲介させている)
      const res = await fetch(url, { credentials: "include" });

      if (!res.ok) {
        throw new Error("投稿の取得に失敗しました");
      }

      const data = await res.json();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, [selectedTagId]);

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

      if (!res.ok && res.status !== 201 && res.status !== 204) {
        // 失敗時にロールバック
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
      }
    } catch {
      // 失敗時にロールバック
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
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchPosts}>再試行</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8">
      <Toast showToast={showToast} icon={Trash} message={message} bg="bg-red-500" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* ヘッダー */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">投稿一覧</h1>
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/posts/new?${searchParams.toString()}`}>
              <Plus className="h-4 w-4 mr-2" />
              新規投稿
            </Link>
          </Button>
        </div>

        {/* タグフィルター: カテゴリ別ドロップダウン */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {(Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>).map(
            (category) => {
              const config = CATEGORY_CONFIG[category];
              const categoryTags = groupedTags[category] || [];
              if (categoryTags.length === 0) return null;

              return (
                <Popover
                  key={category}
                  open={openCategory === category}
                  onOpenChange={(open: boolean) =>
                    setOpenCategory(open ? category : null)
                  }
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-1 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      {config.label}
                      <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2" align="start">
                    <div className="flex flex-col gap-1">
                      {categoryTags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => {
                            handleTagSelect(
                              selectedTagId === tag.id ? null : tag.id
                            );
                            setOpenCategory(null);
                          }}
                          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left hover:text-slate-900 transition-colors ${
                            selectedTagId === tag.id
                              ? "bg-sky-50 text-sky-700 font-medium hover:text-slate-900 transition-colors"
                              : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              category === "faculty"
                                ? "bg-blue-400"
                                : "bg-orange-400"
                            }`}
                          />
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              );
            }
          )}

          {/* 選択中のタグ表示 */}
          {selectedTag && (
            <button
              onClick={() => handleTagSelect(null)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700 border border-sky-200 hover:bg-sky-200 transition-colors"
            >
              {selectedTag.name}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* 投稿一覧 */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-foreground text-lg font-medium mb-2">まだ投稿がありません</p>
            <p className="text-muted-foreground text-sm mb-6">最初の投稿を作成して、みんなと情報を共有しましょう</p>
            <Button asChild>
              <Link href={`/posts/new?${searchParams.toString()}`}>
                <Plus className="h-4 w-4 mr-2" />
                最初の投稿を作成
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}?${searchParams.toString()}`}
                className="block"
              >
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 hover:shadow-md hover:border-primary/30 transition-all">
                  <h2 className="text-lg sm:text-xl font-semibold text-card-foreground mb-2 sm:mb-3 line-clamp-2">
                    {post.title}
                  </h2>
                  {/* タグバッジ */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2 sm:mb-3">
                      {post.tags.map((tag) => {
                        const config =
                          CATEGORY_CONFIG[
                            tag.category as keyof typeof CATEGORY_CONFIG
                          ];
                        return (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className={config?.badge}
                          >
                            {tag.name}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-primary/15 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-primary" />
                      </div>
                      <span>{post.user?.display_name || "匿名"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="break-all">
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleLikeToggle(e, post.id, post.current_user_liked)}
                      className="flex items-center gap-1 hover:text-red-500 transition-colors"
                    >
                      <Heart
                        className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                          post.current_user_liked
                            ? "fill-red-500 text-red-500"
                            : ""
                        }`}
                      />
                      <span>{post.likes_count}</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>{post.comments_count}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
