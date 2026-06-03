import { useEffect, useMemo } from "react";
import { ImagePlus, X } from "lucide-react";

type ImageSelectorProps = {
    selectedImages: File[];
    setSelectedImages: React.Dispatch<React.SetStateAction<File[]>>;
    maxImages?: number;
};

const MAX_IMAGES = 4;

const ImageSelector = ({
    selectedImages,
    setSelectedImages,
    maxImages = MAX_IMAGES,
}: ImageSelectorProps) => {
    const previews = useMemo(
        () =>
            selectedImages.map((file) => ({
                file,
                url: URL.createObjectURL(file),
            })),
        [selectedImages],
    );

    useEffect(() => {
        return () => {
            previews.forEach((preview) => URL.revokeObjectURL(preview.url));
        };
    }, [previews]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        setSelectedImages((prev) => [...prev, ...files].slice(0, maxImages));
        event.target.value = "";
    };

    const handleRemove = (index: number) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-card-foreground">
                    画像
                </label>
                <span className="text-xs text-muted-foreground">
                    {selectedImages.length}/{maxImages}
                </span>
            </div>

            <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition-colors hover:border-primary/60 hover:bg-primary/5">
                <ImagePlus className="mb-2 h-6 w-6 text-primary" />
                <span className="text-sm font-medium text-card-foreground">
                    画像を選択
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                    JPEG / PNG / WebP / GIF、1枚5MBまで
                </span>
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="sr-only"
                    onChange={handleChange}
                    disabled={selectedImages.length >= maxImages}
                />
            </label>

            {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {previews.map(({ file, url }, index) => (
                        <div
                            key={`${file.name}-${file.lastModified}-${index}`}
                            className="relative overflow-hidden rounded-xl border border-slate-200 bg-white"
                        >
                            <img
                                src={url}
                                alt={file.name}
                                className="aspect-square w-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/75"
                                aria-label={`${file.name}を削除`}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageSelector;
