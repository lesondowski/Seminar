import ManagerLayout from "@/components/manager/ManagerLayout";

export default function ManagerSettingsPage() {
  return (
    <ManagerLayout searchPlaceholder="Search settings...">
      <div className="mgr-card">
        <div className="mgr-card-header">
          <h1 className="mgr-card-title">Settings</h1>
        </div>
        <p className="text-slate-600">Màn hình settings đã được tạo để tránh 404 khi điều hướng từ sidebar.</p>
      </div>
    </ManagerLayout>
  );
}
