import { APP_VERSION, APP_TAGLINE } from "@/constants/app";

const Footer = () => {
    return (
        <footer className="text-center text-slate-400 text-sm mt-10 mb-20">
            App Version {APP_VERSION} • {APP_TAGLINE}
        </footer>
    );
};

export default Footer;