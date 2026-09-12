"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type UseUnsavedChangesGuardOptions = {
    /** 未保存の変更があるか。false の間は一切割り込まない */
    isDirty: boolean;
    /** 「保存して移動」で呼ぶ保存処理。保存に成功したら true を返すこと */
    onSave?: () => Promise<boolean>;
};

/**
 * 未保存の変更があるときに、アプリ内リンクでのページ離脱を確認モーダルで止めるフック。
 *
 * App Router には react-router の useBlocker に当たる公式APIが無いため、
 * document の click をキャプチャフェーズで拾って <a> の遷移を横取りしている。
 * Link は内部的に <a> を描画するので、サイドバー・モバイルナビなどはこれで捕まる。
 *
 * 一方 router.push を直接呼ぶボタン（例: BackButton）は click では判別できないので、
 * 呼び出し側から requestNavigation(url) を使って明示的に通す必要がある。
 *
 * 対象外（今回のスコープ外）:
 * - タブを閉じる / リロード（beforeunload）
 * - ブラウザバック（popstate）
 */
const useUnsavedChangesGuard = ({
    isDirty,
    onSave,
}: UseUnsavedChangesGuardOptions) => {
    const router = useRouter();
    const pathname = usePathname();

    const [pendingUrl, setPendingUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // click リスナーは isDirty が変わるたびに貼り直したくないので ref 経由で参照する
    const isDirtyRef = useRef(isDirty);
    isDirtyRef.current = isDirty;

    const currentPathRef = useRef(pathname);
    currentPathRef.current = pathname;

    /**
     * 遷移してよいかを判定する。
     * 未保存の変更があれば false を返し、確認モーダルを開く。
     */
    const requestNavigation = useCallback((url: string) => {
        if (!isDirtyRef.current) return true;
        setPendingUrl(url);
        return false;
    }, []);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (!isDirtyRef.current) return;

            // 修飾キー付きクリック・中クリックは別タブ等で開くので現在のページは離脱しない
            if (e.defaultPrevented) return;
            if (e.button !== 0) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

            const anchor = (e.target as HTMLElement | null)?.closest?.("a");
            if (!anchor) return;

            const href = anchor.getAttribute("href");
            if (!href) return;
            if (anchor.target && anchor.target !== "_self") return;
            if (anchor.hasAttribute("download")) return;

            let url: URL;
            try {
                url = new URL(href, window.location.href);
            } catch {
                return;
            }

            // 外部リンク・mailto 等はアプリ内遷移ではないので対象外
            if (url.origin !== window.location.origin) return;
            // 同じページ内へのリンク（ページ内アンカー含む）は離脱ではない
            if (url.pathname === currentPathRef.current) return;

            e.preventDefault();
            // Link の onClick（モバイルメニューを閉じる等）も走らせたくないので伝播も止める
            e.stopPropagation();

            setPendingUrl(`${url.pathname}${url.search}${url.hash}`);
        };

        document.addEventListener("click", handleClick, true);
        return () => document.removeEventListener("click", handleClick, true);
    }, []);

    const cancel = useCallback(() => {
        setPendingUrl(null);
    }, []);

    /** 変更を破棄してそのまま遷移する */
    const discardAndNavigate = useCallback(() => {
        if (!pendingUrl) return;
        const url = pendingUrl;
        setPendingUrl(null);
        isDirtyRef.current = false;
        router.push(url);
    }, [pendingUrl, router]);

    /** 保存してから遷移する。保存に失敗したら遷移せずモーダルだけ閉じる */
    const saveAndNavigate = useCallback(async () => {
        if (!pendingUrl || !onSave) return;

        setIsSaving(true);
        try {
            const saved = await onSave();
            if (!saved) {
                // 保存失敗時は元のページのエラー表示を見せたいのでモーダルを閉じて留まる
                setPendingUrl(null);
                return;
            }

            const url = pendingUrl;
            setPendingUrl(null);
            isDirtyRef.current = false;
            router.push(url);
        } finally {
            setIsSaving(false);
        }
    }, [pendingUrl, onSave, router]);

    return {
        /** 確認モーダルを開くべきか */
        isConfirmOpen: pendingUrl !== null,
        isSaving,
        requestNavigation,
        cancel,
        discardAndNavigate,
        saveAndNavigate,
    };
};

export default useUnsavedChangesGuard;
