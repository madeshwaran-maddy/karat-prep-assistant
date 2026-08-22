"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const publicPaths = new Set(["/", "/login", "/signup"]);

function hasAuthCookie() {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((cookie) => cookie.startsWith("auth_token="));
}

function getCookieValue(name: string) {
  if (typeof document === "undefined") return "";
  const cookie = document.cookie.split("; ").find((item) => item.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : "";
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const isPublic = publicPaths.has(pathname);
    const loggedIn = hasAuthCookie();
    const isReviewerPath = pathname.startsWith("/reviewer-dashboard");
    const isReviewer = getCookieValue("user_role") === "reviewer";

    if (!loggedIn && !isPublic) {
      router.replace("/login");
      setIsChecking(false);
      return;
    }

    if (loggedIn && isReviewerPath && !isReviewer) {
      router.replace("/dashboard");
      setIsChecking(false);
      return;
    }

    if (loggedIn && (pathname === "/" || pathname === "/login" || pathname === "/signup")) {
      router.replace("/dashboard");
      setIsChecking(false);
      return;
    }

    setIsChecking(false);
  }, [pathname, router]);

  if (isChecking) {
    return null;
  }

  if (!hasAuthCookie() && !publicPaths.has(pathname)) {
    return null;
  }

  if (hasAuthCookie() && pathname.startsWith("/reviewer-dashboard") && getCookieValue("user_role") !== "reviewer") {
    return null;
  }

  if (hasAuthCookie() && (pathname === "/" || pathname === "/login" || pathname === "/signup")) {
    return null;
  }

  return <>{children}</>;
}
