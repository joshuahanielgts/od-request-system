import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, Crown } from 'lucide-react';

const LoginPortal = () => {
  const navigate = useNavigate();

  const portals = [
    {
      title: 'Student Portal',
      description: 'Access your academic records and submit OD requests',
      icon: GraduationCap,
      path: '/student-login',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Faculty Portal',
      description: 'Review and manage student OD requests',
      icon: Users,
      path: '/faculty-login',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'HOD Portal',
      description: 'Administrative access and approval management',
      icon: Crown,
      path: '/hod-login',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/d5e3db49-b66d-44ba-98ac-a8ff3dd35bf3.png" 
            alt="SRM Institute of Science and Technology Logo" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            OD Management System
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            SRM Institute of Science & Technology
          </p>
          <p className="text-md text-gray-500 dark:text-gray-500">
            Choose your portal to access the system
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {portals.map((portal) => {
            const IconComponent = portal.icon;
            return (
              <Card 
                key={portal.path}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(portal.path)}
              >
                <CardHeader className="text-center">
                  <div className={`mx-auto p-4 rounded-full ${portal.bgColor} w-16 h-16 flex items-center justify-center mb-4`}>
                    <IconComponent className={`h-8 w-8 ${portal.iconColor}`} />
                  </div>
                  <CardTitle className="text-xl">{portal.title}</CardTitle>
                  <CardDescription>{portal.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => navigate(portal.path)}>
                    Access Portal
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LoginPortal;