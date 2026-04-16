import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { Tag } from "@/components/features/posts/types";

import { CATEGORY_CONFIG } from "@/components/features/posts/constants";

type TagBadgeProps = {
    tag: Tag;
    onRemove?: (tagId: number) => void;
};

const TagBadge = ({ tag, onRemove }: TagBadgeProps) => {
    const config = CATEGORY_CONFIG[tag.category as keyof typeof CATEGORY_CONFIG];

    return (
        <Badge
            variant="outline"
            className={`${config?.badge} ${onRemove ? "cursor-pointer gap-1" : ""}`}
            onClick={onRemove ? () => onRemove(tag.id) : undefined}
        >
            {tag.name}
            <X className="h-3 w-3" />
        </Badge>
    );
};

export default TagBadge;
