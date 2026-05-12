import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AdminPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/login");
  }, [router]);
  return null;
}
