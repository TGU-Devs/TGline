import FromInput from "./FormInput";
import FromTextarea from "./FromTextarea";
import TagSelector from "./TagSelector";
import FormActions from "./FormActions";

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
    FormErrors: {
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
    isSubmitting,
    cancelUrl,
    FormErrors,
}: FormProps) => {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 lg:p-8">
            <h1 className="text-xl sm:text-2xl font-bold text-card-foreground mb-4 sm:mb-6">
                {newPost ? "新規投稿" : "投稿の編集"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* タイトル */}
                <FromInput title={title} setTitle={setTitle} error={FormErrors.title} />

                {/* 本文 */}
                <FromTextarea body={body} setBody={setBody} error={FormErrors.body} />

                {/* タグ選択 */}
                <TagSelector
                    selectedTagIds={selectedTagIds}
                    setSelectedTagIds={setSelectedTagIds}
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
