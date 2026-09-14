"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ConfirmModalProps = {
    open: boolean;
    icon: LucideIcon;
    title: string;
    description?: string;
    /** 主アクション（例: 保存して移動） */
    confirmLabel: string;
    onConfirm: () => void;
    /** 副アクション（例: 保存せず移動）。省略すると2ボタンになる */
    secondaryLabel?: string;
    onSecondary?: () => void;
    cancelLabel?: string;
    onCancel: () => void;
    /** 処理中はボタンを無効化し、主アクションをスピナーにする */
    isProcessing?: boolean;
};

const ConfirmModal = ({
    open,
    icon: Icon,
    title,
    description,
    confirmLabel,
    onConfirm,
    secondaryLabel,
    onSecondary,
    cancelLabel = "キャンセル",
    onCancel,
    isProcessing = false,
}: ConfirmModalProps) => {
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isProcessing) onCancel();
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, isProcessing, onCancel]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
                onClick={() => !isProcessing && onCancel()}
            />
            <div className="relative bg-card text-card-foreground rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-border">
                <div className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-sky-500/10 text-sky-500 rounded-full mb-4 mx-auto">
                        <Icon size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-center text-card-foreground mb-2">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-muted-foreground text-sm text-center mb-6">
                            {description}
                        </p>
                    )}
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className="w-full px-4 py-2.5 text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-sm shadow-sky-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                            {isProcessing ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                confirmLabel
                            )}
                        </button>
                        {secondaryLabel && onSecondary && (
                            <button
                                type="button"
                                onClick={onSecondary}
                                disabled={isProcessing}
                                className="w-full px-4 py-2.5 text-sm font-medium text-secondary-foreground bg-secondary hover:bg-secondary/80 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {secondaryLabel}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isProcessing}
                            className="w-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {cancelLabel}
                        </button>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isProcessing}
                    aria-label="閉じる"
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default ConfirmModal;
