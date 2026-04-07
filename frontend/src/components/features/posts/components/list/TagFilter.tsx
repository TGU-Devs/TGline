import { useState } from "react";
import { ChevronDown, X } from "lucide-react";

import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

import { CATEGORY_CONFIG } from "../../constants";

import type { Tag } from "../../types";



type TagFilterProps = {
    groupedTags: Record<string, Tag[]>;
    selectedTag: Tag | null | undefined;
    selectedTagId: number | null;
    onTagSelect: (tagId: number | null) => void;
};

const TagFilter = ({
    groupedTags,
    selectedTag,
    selectedTagId,
    onTagSelect,
}: TagFilterProps) => {

    const [openCategory, setOpenCategory] = useState<string | null>(null);

    return (
        <div className="mb-6 flex flex-wrap items-center gap-2">
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
                                            onTagSelect(
                                                selectedTagId === tag.id
                                                    ? null
                                                    : tag.id,
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
            })}

            {/* 選択中のタグ表示 */}
            {selectedTag && (
                <button
                    onClick={() => onTagSelect(null)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700 border border-sky-200 hover:bg-sky-200 transition-colors"
                >
                    {selectedTag.name}
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    );
};

export default TagFilter;
