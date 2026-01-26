import { DashboardSidebar } from "@/app/components/DashboardSidebar";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex min-h-screen">
          <DashboardSidebar />
          <main className="flex-1 md:ml-0">
            {children}
          </main>
        </div>
      );
};

export default AdminLayout;