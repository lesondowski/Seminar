import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ManagerPoiEditor from "@/components/manager/ManagerPoiEditor";
import { managerMockClient } from "@/services/managerMockClient";

export default function EditPoi() {
  const router = useRouter();
  const { id } = router.query;
  const [poi, setPoi] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("managerToken")) {
      router.replace("/manager/login");
      return;
    }
    if (!id) return;
    managerMockClient
      .getPoi(Number(id))
      .then(setPoi)
      .catch(() => setNotFound(true));
  }, [id, router]);

  if (notFound) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p>Không tìm thấy địa điểm.</p>
        <button onClick={() => router.replace("/manager/locations")}>Quay lại</button>
      </div>
    );
  }

  if (!poi) {
    return (
      <div className="mgr-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  async function handleSave(payload) {
    const result = await managerMockClient.updatePoi(Number(id), payload);
    router.push("/manager/locations");
    return result;
  }

  return (
    <ManagerPoiEditor
      initialPoi={poi}
      onSave={handleSave}
      onCancel={() => router.back()}
    />
  );
}
