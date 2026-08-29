"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const PUBLIC_ROUTES = ["/login", "/register"];

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

    if (PUBLIC_ROUTES.includes(pathname)) {
      if (isAuthenticated) router.replace("/");
      else setReady(true);
      return;
    }

    if (!isAuthenticated) router.replace("/login");
    else setReady(true);
  }, [pathname, router]);

  if (!ready) return null;
  return children;
}
