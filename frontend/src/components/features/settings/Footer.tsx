import { APP_VERSION, APP_TAGLINE } from "@/constants/app";
import Link from "next/link";

const Footer = () => {
    return (
        <footer className="text-center text-slate-400 text-sm mt-10 mb-20 space-y-2">
            <div className="flex items-center justify-center gap-3 text-xs">
                <Link href="/terms" className="hover:text-slate-600 hover:underline transition-colors">
                    利用規約
                </Link>
                <span>•</span>
                <Link href="/privacy" className="hover:text-slate-600 hover:underline transition-colors">
                    プライバシーポリシー
                </Link>
            </div>
            <div>
                App Version {APP_VERSION} • {APP_TAGLINE}
            </div>
        </footer>
    );
};

export default Footer;
