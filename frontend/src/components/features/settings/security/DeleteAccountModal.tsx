"use client";

import { AlertTriangle, X } from "lucide-react";

type DeleteAccountModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    isDeleting: boolean;
};

const DeleteAccountModal = ({
    isOpen,
    onClose,
    onDelete,
    isDeleting,
}: DeleteAccountModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-red-50">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        <h3 className="font-bold">最終確認</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        disabled={isDeleting}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <h4 className="font-bold text-slate-800 mb-2">
                        本当にアカウントを削除しますか？
                    </h4>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">
                        この操作を実行すると、あなたのプロフィール、投稿、設定など
                        <span className="font-bold text-red-600">すべてのデータが永久に削除</span>
                        され、復元することはできません。
                    </p>
                </div>

                <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                削除中...
                            </>
                        ) : (
                            "削除する"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccountModal;