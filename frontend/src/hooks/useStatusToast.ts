import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type StatusConfig = {
  message: string;
};

export const useStatusToast = <T extends string>(
  redirectPath: string,
  statusConfig: Record<T, StatusConfig>,
  duration: number = 5000
) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeStatus, setActiveStatus] = useState<T | null>(null);

  useEffect(() => {
    const status = searchParams.get("status") as T | null;
    if (status && statusConfig[status]) {
      setActiveStatus(status);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("status");
      const query = params.toString();
      router.replace(query ? `${redirectPath}?${query}` : redirectPath, { scroll: false });
    }
  }, [searchParams, redirectPath, router]);

  useEffect(() => {
    if (!activeStatus) return;
    const timer = setTimeout(() => setActiveStatus(null), duration);
    return () => clearTimeout(timer);
  }, [activeStatus, duration]);

  return {
    showToast: activeStatus !== null,
    message: activeStatus ? statusConfig[activeStatus].message : "",
  };
};