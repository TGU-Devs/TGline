"use client";

import { useCallback } from "react";
import type { Post } from "@/components/features/posts/types";

export type FeedTab = "all" | "liked";

//投稿一覧のスクロール位置やページ番号、投稿データなどを保存するための型
type PostListSnapshot = {
    scrollY: number;
    page: number;
    posts: Post[];
    hasMore: boolean;
    feed: FeedTab;
    tagId: number | null;
    savedAt: number;
};

const STORAGE_KEY = "post_list_snapshot"; //保存先のキー
const MAX_AGE_MS = 30 * 60 * 1000; // 30分で期限切れ

//フィードタブの型チェック
const isFeedTab = (value: string | null): value is FeedTab => {
    return value === "all" || value === "liked";
};

//文字列をパースして型チェック
const parseSnapshot = (raw: string): PostListSnapshot | null => {
    try {
        const data = JSON.parse(raw) as PostListSnapshot;

        if (
            typeof data.scrollY !== "number" ||
            typeof data.page !== "number" ||
            !Array.isArray(data.posts) ||
            typeof data.hasMore !== "boolean" ||
            !isFeedTab(data.feed) ||
            (data.tagId !== null && typeof data.tagId !== "number") ||
            typeof data.savedAt !== "number"
        ) {
            return null;
        }

        if (Date.now() - data.savedAt > MAX_AGE_MS) {
            return null;
        }

        return data;
    } catch {
        return null;
    }
};

//保存されたデータを読み込む
const readSnapshot = (): PostListSnapshot | null => {
    if (typeof window === "undefined") {
        return null;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return null;
    }

    return parseSnapshot(raw);
};

//保存する
const writeSnapshot = (snapshot: PostListSnapshot) => {
    if (typeof window === "undefined") {
        return;
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
};

//保存されたデータを削除
const removeSnapshot = (): void => {
    if (typeof window === "undefined") {
        return;
    }

    sessionStorage.removeItem(STORAGE_KEY);
};

//保存されたデータがクエリに一致するかどうかをチェック
const matchesQuery = (
    snapshot: PostListSnapshot,
    feed: FeedTab,
    tagId: number | null,
): boolean => {
    return snapshot.feed === feed && snapshot.tagId === tagId;
};

//保存するための入力型
type SaveSnapshotInput = {
    scrollY: number;
    page: number;
    posts: Post[];
    hasMore: boolean;
    feed: FeedTab;
    tagId: number | null;
};

//投稿一覧のスクロール位置やページ番号、投稿データなどを保存するためのフック
export const usePostsListRestore = () => {
    //保存する
    const saveSnapshot = useCallback((input: SaveSnapshotInput) => {
        writeSnapshot({
            ...input,
            savedAt: Date.now(),
        });
    }, []);

    //保存されたデータを読み込む
    const restoreSnapshot = useCallback(
        (feed: FeedTab, tagId: number | null): PostListSnapshot | null => {
            const snapshot = readSnapshot();
            if (!snapshot) return null;
            if (!matchesQuery(snapshot, feed, tagId)) return null;
            return snapshot;
        },
        [],
    );

    //保存されたデータを削除
    const clearSnapshot = useCallback(() => {
        removeSnapshot();
    }, []);

    const applyScroll = useCallback((scrollY: number) => {
        //描画完了後に二段階でスクロール
        requestAnimationFrame(() => {
            window.scrollTo(0, scrollY);
            requestAnimationFrame(() => {
                window.scrollTo(0, scrollY);
            });
        });
    }, []);

    return {
        saveSnapshot,
        restoreSnapshot,
        clearSnapshot,
        applyScroll,
    };
};
