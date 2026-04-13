import FormInput from "./FormInput";
import FormTextarea from "./FormTextarea";
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
    isSubmitting,
    cancelUrl,
    formErrors,
}: FormProps) => {
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
