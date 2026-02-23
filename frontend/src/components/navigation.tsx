import Link from "next/link";
import Image from "next/image";

export function Navigation() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 sm:p-6">
      <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
      <div className='w-18 h-18 flex items-center justify-center mx-auto mb-4 shadow-lg rounded-2xl overflow-hidden bg-white'>
        <Image src="/TGlinelogo.svg" alt="TGline" width={64} height={64} className="w-full h-full mix-blend-multiply" />
      </div>
      </Link>
    </header>
  );
}
