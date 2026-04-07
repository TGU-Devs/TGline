import { useFormValidate } from "@/components/features/posts/hooks/useFormValidate";

type FromInputProps = {
    title: string;
    setTitle: (title: string) => void;
    error?: string;
};

const FromInput = ({ title, setTitle, error }: FromInputProps) => {
    return (
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
                {error ? (
                    <p className="text-sm text-destructive">
                        {error}
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
    );
};

export default FromInput;
