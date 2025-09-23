import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, UserCheck, Users } from "lucide-react";
import Layout from "@/components/Layout";

const Home = () => {
  const navigate = useNavigate();

  const portals = [
    {
      title: "Student Portal",
      description: "Submit and track your OD requests",
      icon: GraduationCap,
      path: "/student-dashboard",
    },
    {
      title: "Faculty Portal", 
      description: "Review and manage student requests",
      icon: UserCheck,
      path: "/faculty-dashboard",
    },
    {
      title: "HOD Portal",
      description: "Administrative oversight and approvals", 
      icon: Users,
      path: "/hod-dashboard",
    }
  ];

  return (
    <Layout title="Dashboard">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome to OD Management System
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Streamline your Outward Duty request process with our comprehensive management platform
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {portals.map((portal) => {
          const IconComponent = portal.icon;
          return (
            <Card key={portal.path} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(portal.path)}>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>{portal.title}</CardTitle>
                <CardDescription>
                  {portal.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={(e) => {
                  e.stopPropagation();
                  navigate(portal.path);
                }}>
                  Access Portal
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Layout>
  );
};

export default Home;