import { AppSidebar } from './AppSidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="app-shell">
      <AppSidebar />
      <main className="main-content ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
