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

    const raw = sessionStorage.getItem(STORAGE_KEY);
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

/** マウント直後に同期的に復元可能なスナップショットを参照する（削除はしない） */
export const peekRestorableSnapshot = (
    feed: FeedTab,
    tagId: number | null,
): PostListSnapshot | null => {
    const snapshot = readSnapshot();
    if (!snapshot) return null;
    if (!matchesQuery(snapshot, feed, tagId)) return null;
    return snapshot;
};

/** 初回レンダー用: スナップショットを読み込んでストレージから削除する */
export const consumeRestorableSnapshot = (
    feed: FeedTab,
    tagId: number | null,
): PostListSnapshot | null => {
    const snapshot = peekRestorableSnapshot(feed, tagId);
    if (snapshot) {
        removeSnapshot();
    }
    return snapshot;
};

const parseFeedFromUrl = (): FeedTab => {
    if (typeof window === "undefined") return "all";
    const feed = new URLSearchParams(window.location.search).get("feed");
    return feed === "liked" ? "liked" : "all";
};

const parseTagIdFromUrl = (): number | null => {
    if (typeof window === "undefined") return null;
    const tagId = new URLSearchParams(window.location.search).get("tag_id");
    return tagId ? Number(tagId) : null;
};

/** page.tsx の useState 初期化用（ストレージを1回だけ消費） */
export const readInitialPostsListState = (): PostListSnapshot | null => {
    if (typeof window === "undefined") return null;
    if (new URLSearchParams(window.location.search).get("deleted")) {
        return null;
    }
    return consumeRestorableSnapshot(parseFeedFromUrl(), parseTagIdFromUrl());
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
        const scroll = () => window.scrollTo({ top: scrollY, behavior: "instant" });

        requestAnimationFrame(() => {
            scroll();
            requestAnimationFrame(scroll);
        });

        window.setTimeout(scroll, 100);
    }, []);

    return {
        saveSnapshot,
        restoreSnapshot,
        clearSnapshot,
        applyScroll,
    };
};
