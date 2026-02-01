"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    // プロキシ経由でアクセスするため相対パスを使用
    fetch("/api/time")
      .then((res) => res.json())
      .then((data) => setTime(data.current_time))
      .catch(() => setTime("Error"));
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold">Next.js + Rails API</h1>
      <p className="mt-4 text-xl">
        サーバー時刻: {time || "Loading..."}
      </p>
      <a
        href="/auth-test"
        className="mt-8 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition-colors"
      >
        🔐 認証テストページへ
      </a>
    </main>
  );
}