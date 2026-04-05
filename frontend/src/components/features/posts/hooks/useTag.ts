import { useState, useEffect, useMemo } from "react";
import type { Tag } from "@/components/features/posts/types";

export const useTags = () => {
    const [tags, setTags] = useState<Tag[]>([]);

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

    // tagsが更新された時だけグループ化を再計算する（パフォーマンス最適化）
    const groupedTags = useMemo(() => {
        return tags.reduce((acc: Record<string, Tag[]>, tag) => {
            if (!acc[tag.category]) acc[tag.category] = [];
            acc[tag.category].push(tag);
            return acc;
        }, {});
    }, [tags]);

    return {
        tags,
        groupedTags,
    };
};
