import { AlertCircle, X } from "lucide-react";

type ModalProps = {
    message: string;
    isDeleting: boolean;
    setShowModal: (show: boolean) => void;
    DeleteHandler: () => void;
};

const Modal = ({
    message,
    isDeleting,
    setShowModal,
    DeleteHandler,
}: ModalProps) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
                onClick={() => !isDeleting && setShowModal(false)}
            />
            <div className="relative bg-card text-card-foreground rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all scale-100 border border-border">
                <div className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-destructive/10 text-destructive rounded-full mb-4 mx-auto">
                        <AlertCircle size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-center text-card-foreground mb-2">
                        {message}
                    </h3>
                    <p className="text-muted-foreground text-sm text-center mb-6">
                        この操作は取り消せません。本当にこの{message}
                        を削除してもよろしいですか？
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowModal(false)}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-secondary-foreground bg-secondary hover:bg-secondary/80 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={DeleteHandler}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 rounded-xl shadow-sm shadow-destructive/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                            {isDeleting ? (
                                // Spinner border colors updated to match destructive-foreground
                                <div className="w-4 h-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                            ) : (
                                "削除する"
                            )}
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default Modal;
