import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Home, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

const Layout = ({ children, title }: LayoutProps) => {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
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
            
            <div className="flex items-center gap-2">
              {profile && (
                <span className="text-sm text-muted-foreground mr-4">
                  Welcome, {profile.full_name} ({profile.role.toUpperCase()})
                </span>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBackToHome}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
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