import { useRouter } from "next/navigation";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type FormActionsProps = {
    newPost: boolean;
    isSubmitting: boolean;
    cancelUrl: string;
};

const FormActions = ({
    newPost,
    isSubmitting,
    cancelUrl,
}: FormActionsProps) => {
    const router = useRouter();
    return (
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
    );
};

export default FormActions;
