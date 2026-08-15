"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const hasToken = document.cookie.includes("auth_token=");
    router.replace(hasToken ? "/dashboard" : "/login");
  }, [router]);

  return null;
}