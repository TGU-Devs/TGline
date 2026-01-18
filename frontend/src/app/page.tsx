"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/time`)
      .then((res) => res.json())
      .then((data) => setTime(data.current_time))
      .catch(() => setTime("Error"));
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Next.js + Rails API</h1>
      <p className="mt-4 text-xl">
        サーバー時刻: {time || "Loading..."}
      </p>
    </main>
  );
}