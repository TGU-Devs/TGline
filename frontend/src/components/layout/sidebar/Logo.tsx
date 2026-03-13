import Image from "next/image";
import Link from "next/link";

type LogoProps = {
    isDesktop?: boolean;
    href?: string;
};

const Logo = ({ isDesktop, href = "/posts" }: LogoProps) => {
    return (
        <Link href={href} className={`flex items-center ${isDesktop ? "justify-center px-4 py-2 " : ""}`}>
            <Image
                src="/TGline-nobg2.png"
                alt="TGline"
                width={140}
                height={45}
                className="w-36 h-auto object-contain"
            />
        </Link>
    );
};

export default Logo;
