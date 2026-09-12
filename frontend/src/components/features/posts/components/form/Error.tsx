// 互換のための再エクスポート。実体は shared/PostNotFound.tsx にある。
// posts/[id]/page.tsx は feature/#113 が変更中のため本計画では import を更新しない。
// #113 マージ後に posts/[id]/page.tsx の import を更新し、このファイルを削除すること。
export { default } from "../shared/PostNotFound";
