import { useState } from "react";

import { useTags } from "@/components/features/posts/hooks/useTag";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import TagBadge from "../shared/TagBadge";

import { CATEGORY_CONFIG } from "@/components/features/posts/constants";

type TagSelectorProps = {
    selectedTagIds: number[];
    setSelectedTagIds: (ids: number[]) => void;
};

const TagSelector = ({ selectedTagIds, setSelectedTagIds }: TagSelectorProps) => {
    const [openCategory, setOpenCategory] = useState<string | null>(null);
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
                                        const isSelected =
                                            selectedTagIds.includes(tag.id);
                                        return (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() =>
                                                    category === "faculty"
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
                        <TagBadge key={tag.id} tag={tag} onRemove={removeTag} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TagSelector;
