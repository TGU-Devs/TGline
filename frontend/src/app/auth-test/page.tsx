"use client";

import { useState } from "react";

// プロキシ経由でアクセスするため、相対パスを使用（同一オリジンになりcookieが正常に動作）
const API_URL = "";

// ユーザー型定義
interface User {
  id: number;
  email: string;
  display_name: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

// APIレスポンス型
interface AuthResponse {
  user: User;
  message: string;
}

interface ErrorResponse {
  error?: string;
  errors?: Record<string, string[]> | string[];
}

export default function AuthTestPage() {
  // 状態管理
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // フォーム状態
  const [signUpForm, setSignUpForm] = useState({
    email: "",
    password: "",
    password_confirmation: "",
    display_name: "",
  });

  const [signInForm, setSignInForm] = useState({
    email: "",
    password: "",
  });

  // ログ追加
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  };

  // ===== API呼び出し関数 =====

  // サインアップ
  const handleSignUp = async () => {
    setIsLoading(true);
    addLog("🔄 サインアップ中...");

    try {
      const res = await fetch(`${API_URL}/api/users/sign_up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Cookie送受信を有効化
        body: JSON.stringify({ user: signUpForm }),
      });

      const data: AuthResponse | ErrorResponse = await res.json();

      if (res.ok) {
        const authData = data as AuthResponse;
        setCurrentUser(authData.user);
        addLog(`✅ サインアップ成功: ${authData.user.email}`);
        setSignUpForm({
          email: "",
          password: "",
          password_confirmation: "",
          display_name: "",
        });
      } else {
        const errorData = data as ErrorResponse;
        addLog(`❌ サインアップ失敗: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      addLog(`❌ エラー: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // サインイン
  const handleSignIn = async () => {
    setIsLoading(true);
    addLog("🔄 サインイン中...");

    try {
      const res = await fetch(`${API_URL}/api/users/sign_in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(signInForm),
      });

      const data: AuthResponse | ErrorResponse = await res.json();

      if (res.ok) {
        const authData = data as AuthResponse;
        setCurrentUser(authData.user);
        addLog(`✅ サインイン成功: ${authData.user.email} (${authData.user.role})`);
        setSignInForm({ email: "", password: "" });
      } else {
        const errorData = data as ErrorResponse;
        addLog(`❌ サインイン失敗: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      addLog(`❌ エラー: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // サインアウト
  const handleSignOut = async () => {
    setIsLoading(true);
    addLog("🔄 サインアウト中...");

    try {
      const res = await fetch(`${API_URL}/api/users/sign_out`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok || res.status === 204) {
        setCurrentUser(null);
        addLog("✅ サインアウト成功");
      } else {
        const data = await res.json();
        addLog(`❌ サインアウト失敗: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      addLog(`❌ エラー: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 自分の情報取得（認証必須）
  const handleGetMe = async () => {
    setIsLoading(true);
    addLog("🔄 自分の情報を取得中...");

    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setCurrentUser(data);
        addLog(`✅ 取得成功: ${data.email} (${data.role})`);
      } else {
        addLog(`❌ 取得失敗 (${res.status}): ${JSON.stringify(data)}`);
        if (res.status === 401) {
          setCurrentUser(null);
        }
      }
    } catch (error) {
      addLog(`❌ エラー: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ユーザー一覧取得（認証不要）
  const handleGetUsers = async () => {
    setIsLoading(true);
    addLog("🔄 ユーザー一覧を取得中...");

    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setUsers(data);
        addLog(`✅ ユーザー一覧取得成功: ${data.length}件`);
      } else {
        addLog(`❌ 取得失敗 (${res.status}): ${JSON.stringify(data)}`);
      }
    } catch (error) {
      addLog(`❌ エラー: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // サーバー時刻取得（認証不要）
  const handleGetTime = async () => {
    setIsLoading(true);
    addLog("🔄 サーバー時刻を取得中...");

    try {
      const res = await fetch(`${API_URL}/api/time`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        addLog(`✅ サーバー時刻: ${data.current_time}`);
      } else {
        addLog(`❌ 取得失敗 (${res.status}): ${JSON.stringify(data)}`);
      }
    } catch (error) {
      addLog(`❌ エラー: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-cyan-400">
          🔐 認証・認可テストページ
        </h1>
        <p className="text-gray-400 mb-8">
          JWT Cookie認証のテスト用ページです
        </p>

        {/* 現在のユーザー状態 */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold mb-2 text-yellow-400">
            📍 現在の認証状態
          </h2>
          {currentUser ? (
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-green-600 rounded-full text-sm">
                ログイン中
              </span>
              <span>
                {currentUser.display_name} ({currentUser.email})
              </span>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  currentUser.role === "admin"
                    ? "bg-red-600"
                    : "bg-blue-600"
                }`}
              >
                {currentUser.role}
              </span>
            </div>
          ) : (
            <span className="px-3 py-1 bg-gray-600 rounded-full text-sm">
              未ログイン
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左カラム: 認証フォーム */}
          <div className="space-y-6">
            {/* サインアップ */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-green-400">
                📝 サインアップ
              </h2>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="メールアドレス"
                  value={signUpForm.email}
                  onChange={(e) =>
                    setSignUpForm({ ...signUpForm, email: e.target.value })
                  }
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="表示名"
                  value={signUpForm.display_name}
                  onChange={(e) =>
                    setSignUpForm({ ...signUpForm, display_name: e.target.value })
                  }
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 outline-none"
                />
                <input
                  type="password"
                  placeholder="パスワード"
                  value={signUpForm.password}
                  onChange={(e) =>
                    setSignUpForm({ ...signUpForm, password: e.target.value })
                  }
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 outline-none"
                />
                <input
                  type="password"
                  placeholder="パスワード（確認）"
                  value={signUpForm.password_confirmation}
                  onChange={(e) =>
                    setSignUpForm({
                      ...signUpForm,
                      password_confirmation: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 outline-none"
                />
                <button
                  onClick={handleSignUp}
                  disabled={isLoading}
                  className="w-full p-2 bg-green-600 hover:bg-green-700 rounded font-semibold disabled:opacity-50"
                >
                  サインアップ
                </button>
              </div>
            </div>

            {/* サインイン */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-blue-400">
                🔑 サインイン
              </h2>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="メールアドレス"
                  value={signInForm.email}
                  onChange={(e) =>
                    setSignInForm({ ...signInForm, email: e.target.value })
                  }
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 outline-none"
                />
                <input
                  type="password"
                  placeholder="パスワード"
                  value={signInForm.password}
                  onChange={(e) =>
                    setSignInForm({ ...signInForm, password: e.target.value })
                  }
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-500 outline-none"
                />
                <button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold disabled:opacity-50"
                >
                  サインイン
                </button>
              </div>
              {/* テスト用アカウント */}
              <div className="mt-4 p-3 bg-gray-700 rounded text-sm">
                <p className="text-gray-400 mb-2">テスト用アカウント:</p>
                <p>
                  <span className="text-cyan-400">一般:</span> tanaka@tgu.ac.jp /
                  password123
                </p>
                <p>
                  <span className="text-red-400">管理者:</span> admin@tgu.ac.jp
                  / admin123
                </p>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-purple-400">
                ⚡ アクション
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleSignOut}
                  disabled={isLoading || !currentUser}
                  className="p-2 bg-red-600 hover:bg-red-700 rounded font-semibold disabled:opacity-50"
                >
                  サインアウト
                </button>
                <button
                  onClick={handleGetMe}
                  disabled={isLoading}
                  className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded font-semibold disabled:opacity-50"
                >
                  自分の情報取得
                </button>
                <button
                  onClick={handleGetUsers}
                  disabled={isLoading}
                  className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded font-semibold disabled:opacity-50"
                >
                  ユーザー一覧
                </button>
                <button
                  onClick={handleGetTime}
                  disabled={isLoading}
                  className="p-2 bg-gray-600 hover:bg-gray-500 rounded font-semibold disabled:opacity-50"
                >
                  サーバー時刻
                </button>
              </div>
            </div>
          </div>

          {/* 右カラム: ログとユーザー一覧 */}
          <div className="space-y-6">
            {/* ログ */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-orange-400">
                  📋 ログ
                </h2>
                <button
                  onClick={() => setLogs([])}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  クリア
                </button>
              </div>
              <div className="h-64 overflow-y-auto bg-gray-900 rounded p-3 font-mono text-sm">
                {logs.length === 0 ? (
                  <p className="text-gray-500">ログがありません</p>
                ) : (
                  logs.map((log, i) => (
                    <p key={i} className="mb-1">
                      {log}
                    </p>
                  ))
                )}
              </div>
            </div>

            {/* ユーザー一覧 */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-cyan-400">
                👥 ユーザー一覧
              </h2>
              {users.length === 0 ? (
                <p className="text-gray-500">
                  「ユーザー一覧」ボタンを押して取得
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 bg-gray-700 rounded"
                    >
                      <div>
                        <span className="font-medium">{user.display_name}</span>
                        <span className="text-gray-400 text-sm ml-2">
                          (ID: {user.id})
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          user.role === "admin"
                            ? "bg-red-600"
                            : "bg-blue-600"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* フッター */}
      </div>
    </div>
  );
}
