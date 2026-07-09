"use client";

import { useState } from "react";

type OnboardingModalProps = {
  isOpen: boolean;
  onSave: (faculty: string, department: string, grade: string) => void;
};

const FACULTY_DATA: Record<string, string[]> = {
  "法学部": ["法律学科"],
  "文学部": ["英文学科", "総合人文学科", "歴史学科", "教育学部"],
  "経済学部": ["経済学科"],
  "経営学部": ["経営学科"],
  "工学部": ["機械知能工学科", "電気電子工学科", "環境建設工学科"],
  "地域総合学科": ["地域コミュニティ学科", "政策デザイン学科"],
  "情報学部": ["データサイエンス学科"],
  "人間科学部": ["  心理行動科学科"],
  "国際学部": ["国際教養学科"],
};

const GRADE_DATA = ["1年生", "2年生", "3年生", "4年生"];

export default function OnboardingModal({ isOpen, onSave }: OnboardingModalProps) {
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [grade, setGrade] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faculty || !department || !grade) {
      alert("学部,学科,学年を選択してください。");
      return;
    }
    onSave(faculty, department, grade);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-2">初期設定</h2>
        <p className="text-sm text-muted-foreground mb-6">
          サービスを利用するために、あなたの学部と学科を選択してください。
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 学部選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">学部</label>
            <select
              value={faculty}
              onChange={(e) => {
                setFaculty(e.target.value);
                setDepartment(""); // 学部が変わったら学科をリセット
              }}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              <option value="">学部を選択してください</option>
              {Object.keys(FACULTY_DATA).map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* 学科選択（学部が選ばれているときだけ有効化） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">学科</label>
            <select
              value={department}
              disabled={!faculty}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">学科を選択してください</option>
              {faculty &&
                FACULTY_DATA[faculty].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
            </select>
          </div>

          
          {/* 学年選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">学年</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              <option value="">学年を選択してください</option>
              {GRADE_DATA.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* 決定ボタン */}
          <button
            type="submit"
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-md font-medium text-sm transition-colors shadow-sm"
          >
            設定を保存する
          </button>
        </form>
      </div>
    </div>
  );
}