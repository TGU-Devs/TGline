import Link from "next/link";
import Image from "next/image";

export function Navigation() {
  return (
    <header className="absolute top-0 left-0 z-50 p-4 sm:p-6">
      <Link href="/" className="block transition-transform hover:scale-105">
        <h1 className="text-2xl font-bold">TGUline</h1>
      </Link>
    </header>
  );
}
