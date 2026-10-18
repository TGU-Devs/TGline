import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type CourseBreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export default function CourseBreadcrumbs({ items }: CourseBreadcrumbsProps) {
  return (
    <nav aria-label="パンくずリスト" className="mb-4">
      <ol className="flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-x-1">
              {index > 0 && <ChevronRight aria-hidden="true" className="size-4 shrink-0" />}
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-md px-2 font-medium transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className="break-words px-2 font-semibold text-slate-900"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
