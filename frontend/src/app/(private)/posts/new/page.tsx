"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, Plus, ChevronDown, X, Check } from "lucide-react";

interface Tag {
  id: number;
  name: string;
  category: "faculty" | "topic";
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

export default function PostNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

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

  const groupedTags = tags.reduce<Record<string, Tag[]>>((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = [];
    acc[tag.category].push(tag);
    return acc;
  }, {});

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

  const handleTopicToggle = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const removeTag = (tagId: number) => {
    setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
  };

  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      alert("タイトルと本文を入力してください");
      return;
    }

    try {
      setIsCreating(true);
      const res = await fetch("/api/posts", {
        method: "POST",
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
            : "投稿の作成に失敗しました"
        );
      }

      const data = await res.json();
      router.push(`/posts/${data.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "投稿の作成に失敗しました");
    } finally {
      setIsCreating(false);
    }
  };

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

        {/* 新規投稿フォーム */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6 lg:p-8">
          <h1 className="text-xl sm:text-2xl font-bold text-card-foreground mb-4 sm:mb-6">新規投稿</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                disabled={isCreating}
                className="w-full sm:w-auto"
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? "作成中..." : "投稿する"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
