"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, Save, ChevronDown, X, Check } from "lucide-react";

import { useFormValidate } from "@/components/features/posts/hooks/useFormValidate";

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
  created_at: string;
  updated_at: string;
}

const CATEGORY_CONFIG = {
  faculty: {
    label: "学部",
    hint: "1つまで",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-400",
  },
  topic: {
    label: "トピック",
    hint: "複数選択可",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-400",
  },
} as const;

export default function PostEditPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const { FormErrors, validateForm, clearErrors } = useFormValidate();

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchPost(params.id as string);
    }
  }, [params.id]);

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
      setTitle(data.title);
      setBody(data.body);
      if (data.tags) {
        setSelectedTagIds(data.tags.map((t: Tag) => t.id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // タグをグループ化
  const groupedTags = tags.reduce<Record<string, Tag[]>>((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = [];
    acc[tag.category].push(tag);
    return acc;
  }, {});

  // 学部タグを選択
  const handleFacultySelect = (tagId: number) => {
    const facultyTagIds = tags
      .filter((t) => t.category === "faculty")
      .map((t) => t.id);
    const otherSelected = selectedTagIds.filter(
      (id) => !facultyTagIds.includes(id)
    );
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(otherSelected);
    } else {
      setSelectedTagIds([...otherSelected, tagId]);
    }
    setOpenCategory(null);
  };

  // トピックタグを選択
  const handleTopicToggle = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  // タグを削除
  const removeTag = (tagId: number) => {
    setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
  };

  // 選択中のタグを取得
  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

      const isValid = validateForm(title, body);
      if (!isValid) return;

      clearErrors();

    try {
      setIsSaving(true);
      const res = await fetch(`/api/posts/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          post: {
            title: title.trim(),
            body: body.trim(),
            tag_ids: selectedTagIds,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.errors
            ? Object.values(errorData.errors).flat().join(", ")
            : "更新に失敗しました"
        );
      }

      router.push(`/posts/${params.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setIsSaving(false);
    }
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
          <Button asChild variant="outline">
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
          <Link href={`/posts/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            詳細に戻る
          </Link>
        </Button>

        {/* 編集フォーム */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 lg:p-8">
          <h1 className="text-xl sm:text-2xl font-bold text-card-foreground mb-4 sm:mb-6">投稿を編集</h1>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* タイトル */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-foreground mb-2"
              >
                タイトル
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground transition-shadow"
                placeholder="投稿のタイトルを入力"
                required
              />
              {FormErrors.title && (
                <p className="mt-1 text-sm text-destructive">{FormErrors.title}</p>
              )}
            </div>

            {/* 本文 */}
            <div>
              <label
                htmlFor="body"
                className="block text-sm font-medium text-foreground mb-2"
              >
                本文
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground resize-y transition-shadow"
                placeholder="投稿の本文を入力"
                required
              />
              {FormErrors.body && (
                <p className="mt-1 text-sm text-destructive">{FormErrors.body}</p>
              )}
            </div>

            {/* タグ選択 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                タグ
              </label>

              {/* ドロップダウン */}
              <div className="flex flex-wrap gap-2 mb-3">
                {(
                  Object.keys(CATEGORY_CONFIG) as Array<
                    keyof typeof CATEGORY_CONFIG
                  >
                ).map((category) => {
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
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 gap-1 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                          {config.label}
                          <span className="text-xs text-slate-400">
                            ({config.hint})
                          </span>
                          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-52 p-2" align="start">
                        <div className="flex flex-col gap-0.5">
                          {categoryTags.map((tag) => {
                            const isSelected = selectedTagIds.includes(tag.id);
                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() =>
                                  category === "faculty"
                                    ? handleFacultySelect(tag.id)
                                    : handleTopicToggle(tag.id)
                                }
                                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors text-left ${
                                  isSelected
                                    ? "bg-sky-50 text-sky-700"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span
                                    className={`h-2 w-2 rounded-full ${config.dot}`}
                                  />
                                  {tag.name}
                                </span>
                                {isSelected && (
                                  <Check className="h-4 w-4 text-sky-500" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  );
                })}
              </div>

              {/* 選択済みタグ */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedTags.map((tag) => {
                    const config =
                      CATEGORY_CONFIG[
                        tag.category as keyof typeof CATEGORY_CONFIG
                      ];
                    return (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className={`${config?.badge} cursor-pointer gap-1`}
                        onClick={() => removeTag(tag.id)}
                      >
                        {tag.name}
                        <X className="h-3 w-3" />
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ボタン */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
