"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, User, Edit, Trash2, ArrowLeft, Heart, MessageCircle, Send } from "lucide-react";

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

interface Comment {
  id: number;
  body: string;
  user: {
    id: number;
    display_name: string;
  } | null;
  created_at: string;
}

interface CurrentUser {
  id: number;
  role: string;
}

const TAG_COLORS: Record<string, string> = {
  faculty: "bg-blue-100 text-blue-700 border-blue-200",
  topic: "bg-orange-100 text-orange-700 border-orange-200",
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchPost(params.id as string);
      fetchComments(params.id as string);
      fetchCurrentUser();
    }
  }, [params.id]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/users/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch {
      // ignore
    }
  };

  const fetchPost = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/posts/${id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("投稿が見つかりません");
        }
        throw new Error("投稿の取得に失敗しました");
      }

      const data = await res.json();
      setPost(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}/comments`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch {
      // ignore
    }
  };

  const handleSubmitComment = async () => {
    if (!commentBody.trim() || !params.id) return;

    try {
      setIsSubmittingComment(true);
      const res = await fetch(`/api/posts/${params.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ comment: { body: commentBody } }),
      });

      if (res.ok || res.status === 201) {
        setCommentBody("");
        fetchComments(params.id as string);
        // コメント数を更新
        setPost((prev) =>
          prev ? { ...prev, comments_count: prev.comments_count + 1 } : prev
        );
      }
    } catch {
      alert("コメントの投稿に失敗しました");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("このコメントを削除しますか？")) return;

    try {
      const res = await fetch(`/api/posts/${params.id}/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok || res.status === 204) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setPost((prev) =>
          prev ? { ...prev, comments_count: prev.comments_count - 1 } : prev
        );
      }
    } catch {
      alert("コメントの削除に失敗しました");
    }
  };

  const isOwnerOrAdmin = (userId: number | undefined) => {
    if (!currentUser || !userId) return false;
    return userId === currentUser.id || currentUser.role === "admin";
  };

  const canDeleteComment = (comment: Comment) => {
    return isOwnerOrAdmin(comment.user?.id);
  };

  const handleDelete = async () => {
    if (!confirm("本当にこの投稿を削除しますか？")) {
      return;
    }

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/posts/${params.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("削除に失敗しました");
      }

      router.push("/posts");
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!post) return;

    const currentLiked = post.current_user_liked;

    // 楽観的 UI 更新
    setPost({
      ...post,
      current_user_liked: !currentLiked,
      likes_count: currentLiked ? post.likes_count - 1 : post.likes_count + 1,
    });

    try {
      const res = await fetch(`/api/posts/${post.id}/likes`, {
        method: currentLiked ? "DELETE" : "POST",
        credentials: "include",
      });

      if (!res.ok && res.status !== 201 && res.status !== 204) {
        // 失敗時にロールバック
        setPost((prev) =>
          prev
            ? {
                ...prev,
                current_user_liked: currentLiked,
                likes_count: currentLiked ? prev.likes_count + 1 : prev.likes_count - 1,
              }
            : prev
        );
      }
    } catch {
      // 失敗時にロールバック
      setPost((prev) =>
        prev
          ? {
              ...prev,
              current_user_liked: currentLiked,
              likes_count: currentLiked ? prev.likes_count + 1 : prev.likes_count - 1,
            }
          : prev
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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || "投稿が見つかりません"}</p>
          <Button asChild >
            <Link href="/posts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              一覧に戻る
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* 戻るボタン */}
        <Button
          asChild
          variant="ghost"
          className="mb-4 sm:mb-6 text-muted-foreground hover:text-foreground"
        >
          <Link href="/posts">
            <ArrowLeft className="h-4 w-4 mr-2" />
            一覧に戻る
          </Link>
        </Button>

        {/* 投稿カード */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6 lg:p-8">
          {/* ヘッダー */}
          <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-4 sm:mb-6 gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-3 sm:mb-4 wrap-break-words">
                {post.title}
              </h1>
              {/* タグバッジ */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        TAG_COLORS[tag.category] || "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{post.user?.display_name || "匿名"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="break-all">{formatDate(post.created_at)}</span>
                </div>
                <button
                  onClick={handleLikeToggle}
                  className="flex items-center gap-1 hover:text-red-500 transition-colors"
                >
                  <Heart
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${
                      post.current_user_liked
                        ? "fill-red-500 text-red-500"
                        : ""
                    }`}
                  />
                  <span>{post.likes_count}</span>
                </button>
              </div>
            </div>
            {isOwnerOrAdmin(post.user?.id) && (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 sm:flex-initial"
                >
                  <Link href={`/posts/${post.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">編集</span>
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 sm:flex-initial"
                >
                  <Trash2 className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{isDeleting ? "削除中..." : "削除"}</span>
                </Button>
              </div>
            )}
          </div>

          {/* 本文 */}
          <div className="prose max-w-none">
            <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap wrap-break-words">
              {post.body}
            </p>
          </div>
        </div>

        {/* コメントセクション */}
        <div className="mt-6 bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6 lg:p-8">
          {/* コメントヘッダー */}
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-card-foreground">
              コメント ({post.comments_count})
            </h2>
          </div>

          {/* コメント入力フォーム */}
          <div className="mb-6">
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="コメントを入力..."
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <div className="flex justify-end mt-2">
              <Button
                onClick={handleSubmitComment}
                disabled={!commentBody.trim() || isSubmittingComment}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmittingComment ? "送信中..." : "送信"}
              </Button>
            </div>
          </div>

          {/* コメント一覧 */}
          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">
              まだコメントはありません
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border border-border rounded-lg p-3 sm:p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <div className="w-5 h-5 bg-primary/15 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">
                        {comment.user?.display_name || "匿名"}
                      </span>
                      <span>{formatDate(comment.created_at)}</span>
                    </div>
                    {canDeleteComment(comment) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap wrap-break-words">
                    {comment.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
