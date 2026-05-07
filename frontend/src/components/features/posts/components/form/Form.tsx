import { X } from "lucide-react";

import FormInput from "./FormInput";
import FormTextarea from "./FormTextarea";
import TagSelector from "./TagSelector";
import ImageSelector from "./ImageSelector";
import FormActions from "./FormActions";
import { getPostImageUrl } from "../../utils/imageUrl";
import type { PostImage } from "../../types";

type FormProps = {
    newPost: boolean;
    isSubmitting: boolean;
    title: string;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    body: string;
    setBody: React.Dispatch<React.SetStateAction<string>>;
    selectedTagIds: number[];
    setSelectedTagIds: React.Dispatch<React.SetStateAction<number[]>>;
    selectedImages: File[];
    setSelectedImages: React.Dispatch<React.SetStateAction<File[]>>;
    existingImages?: PostImage[];
    removedImageIds?: number[];
    setRemovedImageIds?: React.Dispatch<React.SetStateAction<number[]>>;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    cancelUrl: string;
    formErrors: {
        title?: string;
        body?: string;
    };
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
    selectedImages,
    setSelectedImages,
    existingImages = [],
    removedImageIds = [],
    setRemovedImageIds,
    isSubmitting,
    cancelUrl,
    formErrors,
}: FormProps) => {
    const visibleExistingImages = existingImages.filter(
        (image) => !removedImageIds.includes(image.id),
    );

    const handleRemoveExistingImage = (imageId: number) => {
        setRemovedImageIds?.((prev) =>
            prev.includes(imageId) ? prev : [...prev, imageId],
        );
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 lg:p-8">
            <h1 className="text-xl sm:text-2xl font-bold text-card-foreground mb-4 sm:mb-6">
                {newPost ? "新規投稿" : "投稿の編集"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* タイトル */}
                <FormInput title={title} setTitle={setTitle} error={formErrors.title} />

                {/* 本文 */}
                <FormTextarea body={body} setBody={setBody} error={formErrors.body} />

                {/* タグ選択 */}
                <TagSelector
                    selectedTagIds={selectedTagIds}
                    setSelectedTagIds={setSelectedTagIds}
                />

                {visibleExistingImages.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-card-foreground">
                            投稿済み画像
                        </p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {visibleExistingImages.map((image) => (
                                <div
                                    key={image.id}
                                    className="relative overflow-hidden rounded-xl border border-slate-200 bg-white"
                                >
                                    <img
                                        src={getPostImageUrl(image.url)}
                                        alt={image.filename}
                                        className="aspect-square w-full object-cover"
                                    />
                                    {setRemovedImageIds && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveExistingImage(
                                                    image.id,
                                                )
                                            }
                                            className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/75"
                                            aria-label={`${image.filename}を削除`}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <ImageSelector
                    selectedImages={selectedImages}
                    setSelectedImages={setSelectedImages}
                    maxImages={Math.max(0, 4 - visibleExistingImages.length)}
                />

                {/* ボタン */}
                <FormActions
                    newPost={newPost}
                    isSubmitting={isSubmitting}
                    cancelUrl={cancelUrl}
                />
            </form>
        </div>
    );
};

export default Form;
