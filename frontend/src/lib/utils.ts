import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// この関数はshadcn/uiのコンポーネントで使用されているクラスをマージするための関数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
