import Link from "next/link";
import Image from "next/image";

export function Navigation() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 pt-6 sm:pt-8 lg:ml-7">
      <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
      <Image src="/TGline-nobg2.png" alt="TGline" width={200} height={48} className="h-10 w-auto" />
      </Link>
    </header>
  );
}
