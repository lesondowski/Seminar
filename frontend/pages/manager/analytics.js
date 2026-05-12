import ManagerLayout from "@/components/manager/ManagerLayout";

export default function ManagerAnalyticsPage() {
  return (
    <ManagerLayout searchPlaceholder="Search analytics...">
      <div className="mgr-card">
        <div className="mgr-card-header">
          <h1 className="mgr-card-title">Analytics</h1>
        </div>
        <p className="text-slate-600">Màn hình analytics đã được tạo để tránh 404 khi điều hướng từ sidebar.</p>
      </div>
    </ManagerLayout>
  );
}
