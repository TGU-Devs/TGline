import { useState } from "react";
import { useRouter } from "next/navigation";

import { useFormValidate } from "@/components/features/posts/hooks/useFormValidate";
import { useTags } from "@/components/features/posts/hooks/useTag";

import { Plus, ChevronDown, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import TagBadge from "../shared/TagBadge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { CATEGORY_CONFIG } from "@/components/features/posts/constants";

type FormProps = {
    newPost: boolean;
    isSubmitting: boolean;
    title: string;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    body: string;
    setBody: React.Dispatch<React.SetStateAction<string>>;
    selectedTagIds: number[];
    setSelectedTagIds: React.Dispatch<React.SetStateAction<number[]>>;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    cancelUrl: string;
};

const Form = ({
    newPost,
    handleSubmit,
    title,
    setTitle,
    body,
    setBody,
    selectedTagIds,
    setSelectedTagIds,
    isSubmitting,
    cancelUrl,
}: FormProps) => {
    const [openCategory, setOpenCategory] = useState<string | null>(null);

    const router = useRouter();

    const { FormErrors } = useFormValidate();
    const { tags, groupedTags } = useTags();

    const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));

    const removeTag = (tagId: number) => {
        setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
    };

    const handleTopicToggle = (tagId: number) => {
        if (selectedTagIds.includes(tagId)) {
            setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
        } else {
            setSelectedTagIds([...selectedTagIds, tagId]);
        }
    };

    const handleFacultySelect = (tagId: number) => {
        const facultyTagIds = tags
            .filter((t) => t.category === "faculty")
            .map((t) => t.id);
        const otherSelected = selectedTagIds.filter(
            (id) => !facultyTagIds.includes(id),
        );
        if (selectedTagIds.includes(tagId)) {
            setSelectedTagIds(otherSelected);
        } else {
            setSelectedTagIds([...otherSelected, tagId]);
        }
        setOpenCategory(null);
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 lg:p-8">
            <h1 className="text-xl sm:text-2xl font-bold text-card-foreground mb-4 sm:mb-6">
                {newPost ? "新規投稿" : "投稿の編集"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* タイトル */}
                <div>
                    <label
                        htmlFor="title"
                        className="block text-sm font-medium text-foreground mb-2"
                    >
                        タイトル
                        <span className="text-destructive ml-1">※必須</span>
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={100}
                        className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground transition-shadow"
                        placeholder="投稿のタイトルを入力"
                        required
                    />
                    <div className="flex justify-between mt-1">
                        {FormErrors.title ? (
                            <p className="text-sm text-destructive">
                                {FormErrors.title}
                            </p>
                        ) : (
                            <span />
                        )}
                        <span
                            className={`text-xs ${title.length >= 100 ? "text-destructive" : "text-muted-foreground"}`}
                        >
                            {title.length}/100
                        </span>
                    </div>
                </div>

                {/* 本文 */}
                <div>
                    <label
                        htmlFor="body"
                        className="block text-sm font-medium text-foreground mb-2"
                    >
                        本文
                        <span className="text-destructive ml-1">※必須</span>
                    </label>
                    <textarea
                        id="body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        maxLength={10000}
                        rows={12}
                        className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground resize-y transition-shadow"
                        placeholder="投稿の本文を入力"
                        required
                    />
                    <div className="flex justify-between mt-1">
                        {FormErrors.body ? (
                            <p className="text-sm text-destructive">
                                {FormErrors.body}
                            </p>
                        ) : (
                            <span />
                        )}
                        <span
                            className={`text-xs ${body.length >= 10000 ? "text-destructive" : "text-muted-foreground"}`}
                        >
                            {body.length}/10000
                        </span>
                    </div>
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
                                    <PopoverContent
                                        className="w-52 p-2"
                                        align="start"
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            {categoryTags.map((tag) => {
                                                const isSelected =
                                                    selectedTagIds.includes(
                                                        tag.id,
                                                    );
                                                return (
                                                    <button
                                                        key={tag.id}
                                                        type="button"
                                                        onClick={() =>
                                                            category ===
                                                            "faculty"
                                                                ? handleFacultySelect(
                                                                      tag.id,
                                                                  )
                                                                : handleTopicToggle(
                                                                      tag.id,
                                                                  )
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
                            {selectedTags.map((tag) => (
                                <TagBadge
                                    key={tag.id}
                                    tag={tag}
                                    onRemove={removeTag}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ボタン */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(cancelUrl)}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto"
                    >
                        キャンセル
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {newPost
                            ? isSubmitting
                                ? "作成中..."
                                : "投稿する"
                            : isSubmitting
                              ? "更新中..."
                              : "保存する"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Form;
