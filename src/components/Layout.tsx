import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

const Layout = ({ children, title }: LayoutProps) => {
  const { user, logout } = useAuth();

  const handleBackToHome = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/d5e3db49-b66d-44ba-98ac-a8ff3dd35bf3.png" 
                alt="SRM Institute of Science and Technology Logo" 
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">OD Management System</h1>
                <p className="text-sm text-muted-foreground">SRM Institute of Science & Technology</p>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleBackToHome}
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;