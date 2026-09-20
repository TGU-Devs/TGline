"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {AlertTriangle, ArrowLeft, CheckCircle2, Eye, Mail, Send, Users, } from "lucide-react";

import { Button } from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { useUser } from "@/contexts/UserContext";

const SUBJECT_MAX_LENGTH = 100;
const BODY_MAX_LENGTH = 10000;
const DUMMY_RECIPIENT_COUNT = 1284;

type Announcement = {
	id: number;
	subject: string;
	body: string;
	sentAt: string;
	sender: string;
	target: string;
};

// TODO: API 繋ぎ込み: 配信履歴を API から取得する
const DUMMY_ANNOUNCEMENTS: Announcement[] = [
	{
		id: 2,
		subject: "秋学期の履修登録について",
		body: "秋学期の履修登録期間は9月25日から10月2日までです。登録内容を確認のうえ、期限内に手続きを行ってください。",
		sentAt: "2026-09-17T10:30:00+09:00",
		sender: "管理者",
		target: "全ユーザー",
	},
	{
		id: 1,
		subject: "TGlineへようこそ",
		body: "TGlineからのお知らせをメールとアプリ内通知でお届けします。",
		sentAt: "2026-09-01T09:00:00+09:00",
		sender: "管理者",
		target: "全ユーザー",
	},
];

const formatDate = (dateString: string) =>
	new Date(dateString).toLocaleString("ja-JP", {
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

export default function AnnouncementForm() {
	const router = useRouter();
	const { user, isLoading: userLoading } = useUser();
	const [subject, setSubject] = useState("");
	const [body, setBody] = useState("");
	const [errors, setErrors] = useState<{ subject?: string; body?: string }>({});
	const [announcements, setAnnouncements] = useState(DUMMY_ANNOUNCEMENTS);
	const [selectedAnnouncement, setSelectedAnnouncement] =
		useState<Announcement | null>(null);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [isSent, setIsSent] = useState(false);
	// TODO: API 繋ぎ込み: 配信対象の全ユーザー数を API から取得する

	useEffect(() => {
		if (!userLoading && (!user || user.role !== "admin")) {
			router.replace("/posts");
		}
	}, [router, user, userLoading]);

	const validate = () => {
		const nextErrors: { subject?: string; body?: string } = {};
		if (!subject.trim()) nextErrors.subject = "件名を入力してください。";
		if (!body.trim()) nextErrors.body = "本文を入力してください。";
		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handlePreview = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsSent(false);
		if (validate()) setIsPreviewOpen(true);
	};

	const handleSend = () => {
		// TODO: API 繋ぎ込み: 件名・本文を API に送信する
		const newAnnouncement: Announcement = {
			id: Date.now(),
			subject: subject.trim(),
			body: body.trim(),
			sentAt: new Date().toISOString(),
			sender: user?.display_name || user?.email || "管理者",
			target: "全ユーザー",
		};
		setAnnouncements((current) => [newAnnouncement, ...current]);
		setIsConfirmOpen(false);
		setIsPreviewOpen(false);
		setSubject("");
		setBody("");
		setErrors({});
		setIsSent(true);
	};

	if (userLoading || !user || user.role !== "admin") return null;

	return (
		<div className="min-h-screen bg-background py-6 sm:py-10">
			<div className="mx-auto max-w-5xl px-4 sm:px-6">
				<div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<Button variant="ghost" className="mb-2 -ml-3" onClick={() => router.push("/admin")}>
							<ArrowLeft />
							管理ダッシュボードへ戻る
						</Button>
						<h1 className="text-2xl font-bold text-foreground sm:text-3xl">メールを作成</h1>
						<p className="mt-1 text-sm text-muted-foreground">全ユーザーへメールとアプリ内通知を配信します。</p>
					</div>
					<div className="flex items-center gap-2 self-start rounded-full bg-blue-50 px-3 py-2 text-sm text-blue-700">
						<Users className="h-4 w-4" />
						配信対象: 全ユーザー
					</div>
				</div>

				{isSent && (
					<div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
						<CheckCircle2 className="h-5 w-5 shrink-0" />
						お知らせを送信しました。送信内容は配信履歴に追加されています。
					</div>
				)}

				<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
					<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
						<div className="mb-6 flex items-center gap-3">
							<div className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><Mail className="h-5 w-5" /></div>
							<div><h2 className="font-semibold">新しいお知らせ</h2><p className="text-xs text-muted-foreground">送信前に内容を確認できます</p></div>
						</div>
						<form onSubmit={handlePreview} className="space-y-5" noValidate>
							<div>
								<label htmlFor="announcement-subject" className="mb-2 block text-sm font-medium">件名 <span className="text-destructive">※必須</span></label>
								<input id="announcement-subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={SUBJECT_MAX_LENGTH} placeholder="メールの件名を入力" className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring" />
								<div className="mt-1 flex justify-between text-xs"><span className="text-destructive">{errors.subject || " "}</span><span className={subject.length >= SUBJECT_MAX_LENGTH ? "text-destructive" : "text-muted-foreground"}>{subject.length}/{SUBJECT_MAX_LENGTH}</span></div>
							</div>
							<div>
								<label htmlFor="announcement-body" className="mb-2 block text-sm font-medium">本文 <span className="text-destructive">※必須</span></label>
								<textarea id="announcement-body" value={body} onChange={(event) => setBody(event.target.value)} maxLength={BODY_MAX_LENGTH} rows={10} placeholder="お知らせの本文を入力" className="w-full resize-y rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring" />
								<div className="mt-1 flex justify-between text-xs"><span className="text-destructive">{errors.body || " "}</span><span className={body.length >= BODY_MAX_LENGTH ? "text-destructive" : "text-muted-foreground"}>{body.length}/{BODY_MAX_LENGTH}</span></div>
							</div>
							<div className="rounded-lg bg-slate-50 px-4 py-3 text-sm"><span className="font-medium">配信対象:</span> 全ユーザー <span className="text-muted-foreground">（約{DUMMY_RECIPIENT_COUNT.toLocaleString()}人）</span></div>
							<Button type="submit" className="w-full"><Eye />プレビューを確認</Button>
						</form>
					</section>

					<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
						<div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">配信履歴</h2><p className="mt-1 text-xs text-muted-foreground">過去に送信したお知らせ</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{announcements.length}件</span></div>
						{announcements.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-muted-foreground">配信履歴はまだありません。</div> : <div className="divide-y divide-slate-100">{announcements.map((announcement) => <button key={announcement.id} type="button" onClick={() => setSelectedAnnouncement(announcement)} className="w-full py-4 text-left transition-colors first:pt-0 last:pb-0 hover:bg-slate-50"><p className="line-clamp-1 font-medium">{announcement.subject}</p><div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground"><span>{formatDate(announcement.sentAt)}</span><span>・</span><span>{announcement.sender}</span><span>・</span><span>{announcement.target}</span></div></button>)}</div>}
					</section>
				</div>
			</div>

			<Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
				<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
					<DialogHeader><DialogTitle>送信前プレビュー</DialogTitle><DialogDescription>実際に届く内容を確認してください。</DialogDescription></DialogHeader>
					<div className="rounded-xl border bg-slate-50 p-5"><p className="mb-4 text-lg font-semibold">{subject}</p><p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{body}</p></div>
					<DialogFooter><Button type="button" variant="outline" onClick={() => setIsPreviewOpen(false)}>編集に戻る</Button><Button type="button" onClick={() => setIsConfirmOpen(true)}><Send />送信へ進む</Button></DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
				<DialogContent className="sm:max-w-md"><DialogHeader><div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700"><AlertTriangle className="h-5 w-5" /></div><DialogTitle>送信を実行しますか？</DialogTitle><DialogDescription>全ユーザー（{DUMMY_RECIPIENT_COUNT.toLocaleString()}人）にメールとアプリ内通知を送信します。この操作は取り消せません。</DialogDescription></DialogHeader><DialogFooter><Button type="button" variant="outline" onClick={() => setIsConfirmOpen(false)}>キャンセル</Button><Button type="button" onClick={handleSend}><Send />送信する</Button></DialogFooter></DialogContent>
			</Dialog>

			<Dialog open={selectedAnnouncement !== null} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
				<DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>{selectedAnnouncement?.subject}</DialogTitle><DialogDescription>{selectedAnnouncement && `${formatDate(selectedAnnouncement.sentAt)} ・ ${selectedAnnouncement.sender} ・ ${selectedAnnouncement.target}`}</DialogDescription></DialogHeader><div className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">{selectedAnnouncement?.body}</div></DialogContent>
			</Dialog>
		</div>
	);
}
