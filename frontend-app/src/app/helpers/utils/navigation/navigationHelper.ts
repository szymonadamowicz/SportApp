import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const memory = new Map<string, string>();

export const useRememberedRoute = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fullUrl = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    memory.set(pathname, fullUrl);
  }, [pathname, searchParams]);

  return (targetPath: string) => {
    return memory.get(targetPath) ?? targetPath;
  };
};
