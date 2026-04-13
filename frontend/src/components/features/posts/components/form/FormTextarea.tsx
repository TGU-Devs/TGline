type FormTextareaProps = {
    body: string;
    setBody: (body: string) => void;
    error?: string;
};

const FormTextarea = ({ body, setBody, error }: FormTextareaProps) => {
    return (
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
                {error ? (
                    <p className="text-sm text-destructive">
                        {error}
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
    );
};

export default FormTextarea;
