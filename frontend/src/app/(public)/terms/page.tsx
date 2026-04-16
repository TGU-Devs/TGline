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
              <h2 className="text-lg font-semibold text-foreground mb-3">第1条（定義）</h2>
              <p className="mb-2">本規約において、以下の用語は次の意味で使用します。</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>「本サービス」とは、TGlineが提供する学内情報共有掲示板サービスをいいます。</li>
                <li>「利用者」とは、本サービスに登録し利用する個人をいいます。</li>
                <li>「運営」とは、本サービスを運営・管理するTGline運営チームをいいます。</li>
                <li>「コンテンツ」とは、利用者が本サービスに投稿するテキスト等の情報をいいます。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第2条（適用範囲）</h2>
              <p>
                本規約は、本サービスの利用に関する運営と利用者との間の権利義務関係を定めるものであり、
                本サービスの利用に関わる一切の関係に適用されます。
                利用者は、本規約に同意の上で本サービスを利用するものとします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第3条（サービスの目的）</h2>
              <p>
                本サービスは、東北学院大学の学生・教職員・関係者が
                授業、就職活動、サークル活動等に関する情報を共有することを目的とした
                学内情報共有掲示板サービスです。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第4条（利用資格）</h2>
              <p>
                本サービスは、東北学院大学の学生、教職員、およびその関係者を対象としています。
                利用者は正確な情報を登録し、自身のアカウントを適切に管理する責任を負います。
                一つのアカウントを複数人で共有することはできません。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第5条（禁止事項）</h2>
              <p className="mb-2">利用者は、以下の行為を行ってはなりません。</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>他の利用者に対する誹謗中傷、ハラスメント、差別的表現</li>
                <li>個人情報の無断公開</li>
                <li>著作権・知的財産権を侵害する行為</li>
                <li>商用利用、広告、勧誘行為</li>
                <li>虚偽情報の意図的な投稿</li>
                <li>スパム行為（大量投稿、同一内容の繰り返し投稿等）</li>
                <li>他の利用者へのなりすまし</li>
                <li>不正アクセス、システムへの攻撃行為</li>
                <li>法令または公序良俗に反する行為</li>
                <li>その他、運営が不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第6条（投稿コンテンツの取り扱い）</h2>
              <p>
                利用者が投稿したコンテンツの著作権は投稿者に帰属します。
                ただし、利用者は運営に対し、本サービスの提供・運営・改善・宣伝に必要な範囲で、
                コンテンツを非独占的に利用する権利を無償で許諾するものとします。
                運営が不適切と判断した投稿は、事前通知なく削除する場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第7条（アカウントの停止・削除）</h2>
              <p className="mb-2">
                運営は、利用者が本規約に違反した場合、違反の程度に応じて以下の措置を講じることができます。
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>警告の通知</li>
                <li>該当コンテンツの削除</li>
                <li>一定期間の利用制限</li>
                <li>アカウントの永久停止または削除</li>
              </ul>
              <p className="mt-2">
                緊急性が高い場合、運営は事前通知なく上記の措置を講じることがあります。
                措置に対する異議がある場合は、
                <a href="mailto:tguboard@gmail.com" className="text-primary hover:underline">tguboard@gmail.com</a>
                までご連絡ください。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第8条（免責事項）</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>運営は、本サービスの中断、変更、終了により生じた損害について、
                    運営の故意または重大な過失による場合を除き、責任を負いません。</li>
                <li>利用者間のトラブルについて、運営は原則として関与しません。</li>
                <li>本サービスに投稿された情報の正確性、完全性について、運営は保証しません。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第9条（サービスの変更・終了）</h2>
              <p>
                運営は、利用者への事前通知をもって本サービスの全部または一部を変更・終了できるものとします。
                サービス終了時は、可能な限り30日前までに本サービス内で通知します。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第10条（規約の変更）</h2>
              <p>
                運営は、必要に応じて本規約を変更できるものとします。
                変更後の規約は、本サービス内での通知をもって効力を生じます。
                変更後も本サービスの利用を継続した場合、利用者は変更後の規約に同意したものとみなします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第11条（準拠法・管轄裁判所）</h2>
              <p>
                本規約の解釈および適用は日本法に準拠するものとします。
                本サービスに関する紛争については、仙台地方裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">第12条（お問い合わせ）</h2>
              <p>
                本規約に関するお問い合わせは、下記までご連絡ください。
              </p>
              <p className="mt-2">
                TGline運営チーム<br />
                メール: <a href="mailto:tguboard@gmail.com" className="text-primary hover:underline">tguboard@gmail.com</a>
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                ※ 本利用規約は学内プロジェクト用に作成されたものです。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
