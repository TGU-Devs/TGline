import { useEffect, useState } from "react";

import { MessageCircle, Send, Trash2, User } from "lucide-react";

import formatDate from "@/utils/formatDate";

import { useCurrentUser } from "@/components/features/posts/hooks/useCurrentUser";
import { linkify } from "@/utils/linkify";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";

import type { Comment } from "@/components/features/posts/types";

type CommentSectionProps = {
    postId: number;
    commentsCount: number;
    onCommentCountChange: (change: number) => void;
};

const CommentSection = ({
    postId,
    commentsCount,
    onCommentCountChange,
}: CommentSectionProps) => {
    const { isOwnerOrAdmin } = useCurrentUser();

    const [comments, setComments] = useState<Comment[]>([]);
    const [commentBody, setCommentBody] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [showCommentDeleteModal, setShowCommentDeleteModal] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

    useEffect(() => {
        if (postId) {
            fetchComments(postId);
        }
    }, [postId]);

    const fetchComments = async (id: number) => {
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
        if (!commentBody.trim() || !postId) return;

        try {
            setIsSubmittingComment(true);
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ comment: { body: commentBody } }),
            });

            if (res.ok || res.status === 201) {
                setCommentBody("");
                fetchComments(postId);
                // コメント数を更新
                onCommentCountChange(1);
            }
        } catch {
            alert("コメントの投稿に失敗しました");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleDeleteComment = async () => {
        if (!deletingCommentId || !postId) return;

        try {
            const res = await fetch(
                `/api/posts/${postId}/comments/${deletingCommentId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                },
            );

            if (res.ok || res.status === 204) {
                // 自身 (CommentSection) のコメント一覧から削除
                setComments((prev) =>
                    prev.filter((c) => c.id !== deletingCommentId),
                );
                // 親のコメント数を -1 する
                onCommentCountChange(-1);
            }
        } catch {
            alert("コメントの削除に失敗しました");
        } finally {
            setShowCommentDeleteModal(false);
            setDeletingCommentId(null);
        }
    };

    const canDeleteComment = (comment: Comment) => {
        return isOwnerOrAdmin(comment.user?.id);
    };

    return (
        <div className="mt-6 bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 lg:p-8">
            {showCommentDeleteModal && (
                <Modal
                    message="コメント"
                    isDeleting={false}
                    setShowModal={setShowCommentDeleteModal}
                    DeleteHandler={handleDeleteComment}
                />
            )}
            {/* コメントヘッダー */}
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-card-foreground">
                    コメント ({commentsCount})
                </h2>
            </div>

            {/* コメント入力フォーム */}
            <div className="mb-6">
                <textarea
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    maxLength={1000}
                    placeholder="コメントを入力..."
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                    <span
                        className={`text-xs ${commentBody.length >= 1000 ? "text-destructive" : "text-muted-foreground"}`}
                    >
                        {commentBody.length}/1000
                    </span>
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
                                    <span>
                                        {formatDate(comment.created_at)}
                                    </span>
                                </div>
                                {canDeleteComment(comment) && (
                                    <button
                                        onClick={() => {
                                            setShowCommentDeleteModal(true);
                                            setDeletingCommentId(comment.id);
                                        }}
                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-foreground whitespace-pre-wrap break-all">
                                {linkify(comment.body)}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentSection;
