import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          新規登録に戻る
        </Link>

        <div className="bg-card/80 backdrop-blur-lg p-6 sm:p-8 rounded-xl shadow-lg border border-border/50">
          <h1 className="text-2xl font-bold text-foreground mb-6">利用規約</h1>
          <p className="text-sm text-muted-foreground mb-8">最終更新日: 2026年4月15日</p>

          <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第1条（サービスの目的）</h2>
              <p>
                TGline（以下「本サービス」）は、東北学院大学の学生・教職員・関係者が
                授業、就職活動、サークル活動等に関する情報を共有することを目的とした
                学内情報共有掲示板サービスです。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第2条（利用資格）</h2>
              <p>
                本サービスは、東北学院大学の学生、教職員、およびその関係者を対象としています。
                利用者は正確な情報を登録し、自身のアカウントを適切に管理する責任を負います。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第3条（禁止事項）</h2>
              <p className="mb-2">利用者は、以下の行為を行ってはなりません。</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>他の利用者に対する誹謗中傷、ハラスメント行為</li>
                <li>個人情報の無断公開</li>
                <li>著作権・知的財産権を侵害する行為</li>
                <li>商用利用、広告、勧誘行為</li>
                <li>虚偽情報の意図的な投稿</li>
                <li>不正アクセス、システムへの攻撃行為</li>
                <li>法令または公序良俗に反する行為</li>
                <li>その他、運営が不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第4条（投稿コンテンツの取り扱い）</h2>
              <p>
                利用者が投稿したコンテンツの著作権は、原則として投稿者に帰属します。
                ただし、運営は本サービスの提供・改善のために投稿コンテンツを利用できるものとします。
                運営が不適切と判断した投稿は、事前通知なく削除する場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第5条（アカウントの停止・削除）</h2>
              <p>
                本規約に違反した場合、運営は利用者のアカウントを事前通知なく
                停止または削除する場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第6条（免責事項）</h2>
              <p>
                運営は、本サービスの中断、変更、終了により生じた損害について
                一切の責任を負いません。利用者間のトラブルについても、
                運営は原則として関与しません。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第7条（規約の変更）</h2>
              <p>
                運営は、必要に応じて本規約を変更できるものとします。
                変更後の規約は、本サービス内での通知をもって効力を生じます。
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                ※ 本利用規約は学内プロジェクト用のドラフトであり、法的拘束力を持つものではありません。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
