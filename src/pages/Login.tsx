import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { user, selectRole } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const roleRoutes = {
        student: "/student-dashboard",
        hod: "/hod-dashboard",
        faculty: "/faculty-dashboard"
      };
      navigate(roleRoutes[user.role]);
    }
  }, [user, navigate]);

  const roles = [
    {
      id: "student" as const,
      title: "Student Portal",
      description: "Access your OD requests and submit new applications",
      icon: GraduationCap,
      route: "/student-dashboard"
    },
    {
      id: "hod" as const,
      title: "HOD Portal",
      description: "Review and approve/reject OD requests",
      icon: Users,
      route: "/hod-dashboard"
    },
    {
      id: "faculty" as const,
      title: "Faculty Portal",
      description: "View class-wise OD information",
      icon: BookOpen,
      route: "/faculty-dashboard"
    }
  ];

  const handleRoleSelect = (role: 'student' | 'hod' | 'faculty', route: string) => {
    selectRole(role);
    navigate(route);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-6">
          <img 
            src="/lovable-uploads/d5e3db49-b66d-44ba-98ac-a8ff3dd35bf3.png" 
            alt="SRM Institute of Science and Technology Logo" 
            className="h-20 w-auto mx-auto"
          />
          <div>
            <h1 className="text-4xl font-bold text-foreground">OD Management System</h1>
            <p className="text-lg text-muted-foreground">SRM Institute of Science & Technology</p>
            <p className="text-sm text-muted-foreground mt-2">Professional On Duty Request Management</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card 
                key={role.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-primary"
                onClick={() => handleRoleSelect(role.id, role.route)}
              >
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {role.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Login;