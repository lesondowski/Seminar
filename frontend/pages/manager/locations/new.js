import { useEffect } from "react";
import { useRouter } from "next/router";
import ManagerPoiEditor from "@/components/manager/ManagerPoiEditor";
import { managerMockClient } from "@/services/managerMockClient";

export default function NewPoi() {
  const router = useRouter();

  useEffect(() => {
    if (!sessionStorage.getItem("managerToken")) {
      router.replace("/manager/login");
    }
  }, [router]);

  async function handleSave(payload) {
    const result = await managerMockClient.createPoi(payload);
    router.push("/manager/locations");
    return result;
  }

  return (
    <ManagerPoiEditor
      initialPoi={null}
      onSave={handleSave}
      onCancel={() => router.back()}
    />
  );
}
