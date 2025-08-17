import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Clock, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";

interface Student {
  id: string;
  name: string;
  eventName: string;
  fromPeriod: number;
  toPeriod: number;
  date: string;
}

interface ClassData {
  className: string;
  students: Student[];
}

const FacultyDashboard = () => {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if not authenticated or not faculty
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    if (user.role !== 'faculty') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  const classesData: ClassData[] = [
    {
      className: "I CSE A",
      students: [
        {
          id: "CS21001",
          name: "John Doe",
          eventName: "Tech Symposium",
          fromPeriod: 2,
          toPeriod: 7,
          date: "2024-03-15"
        },
        {
          id: "CS21003",
          name: "Alice Johnson",
          eventName: "Coding Workshop",
          fromPeriod: 1,
          toPeriod: 4,
          date: "2024-03-15"
        }
      ]
    },
    {
      className: "I CSE B",
      students: [
        {
          id: "CS21025",
          name: "Bob Wilson",
          eventName: "AI Conference",
          fromPeriod: 3,
          toPeriod: 6,
          date: "2024-03-15"
        }
      ]
    },
    {
      className: "II CSE A",
      students: [
        {
          id: "CS20015",
          name: "Sarah Davis",
          eventName: "Research Presentation",
          fromPeriod: 1,
          toPeriod: 5,
          date: "2024-03-15"
        },
        {
          id: "CS20027",
          name: "Mike Brown",
          eventName: "Industry Visit",
          fromPeriod: 4,
          toPeriod: 7,
          date: "2024-03-15"
        }
      ]
    },
    {
      className: "II CSE B",
      students: [
        {
          id: "CS20045",
          name: "Emma Wilson",
          eventName: "Hackathon",
          fromPeriod: 2,
          toPeriod: 7,
          date: "2024-03-15"
        }
      ]
    },
    {
      className: "III CSE A",
      students: []
    },
    {
      className: "III CSE B",
      students: [
        {
          id: "CS19032",
          name: "David Lee",
          eventName: "Internship Interview",
          fromPeriod: 5,
          toPeriod: 7,
          date: "2024-03-15"
        }
      ]
    },
    {
      className: "IV CSE A",
      students: []
    },
    {
      className: "IV CSE B",
      students: [
        {
          id: "CS18021",
          name: "Lisa Anderson",
          eventName: "Campus Recruitment",
          fromPeriod: 1,
          toPeriod: 3,
          date: "2024-03-15"
        }
      ]
    }
  ];

  const getPeriodText = (from: number, to: number) => {
    if (from === to) {
      return `${from}${getOrdinalSuffix(from)} period`;
    }
    return `${from}${getOrdinalSuffix(from)} to ${to}${getOrdinalSuffix(to)} period`;
  };

  const getOrdinalSuffix = (num: number) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = num % 100;
    return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  };

  const selectedClassData = classesData.find(c => c.className === selectedClass);
  const totalODStudents = classesData.reduce((sum, cls) => sum + cls.students.length, 0);

  if (!user) {
    return null; // Will redirect
  }

  return (
    <Layout title="Faculty Dashboard">
      <div className="mb-6 text-muted-foreground">Welcome back, {user.name}!</div>
      <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{classesData.length}</div>
                <p className="text-xs text-muted-foreground">
                  Across all years
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Students on OD Today</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalODStudents}</div>
                <p className="text-xs text-muted-foreground">
                  Currently on duty
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {classesData.filter(c => c.students.length > 0).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  With students on OD
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Class Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Select Class
              </CardTitle>
              <CardDescription>
                Choose a class to view students currently on OD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classesData.map((classData) => (
                    <SelectItem key={classData.className} value={classData.className}>
                      {classData.className} 
                      {classData.students.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {classData.students.length}
                        </Badge>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Class Details */}
          {selectedClass && selectedClassData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {selectedClass} - Students on OD
                  </span>
                  <Badge variant="secondary">
                    {selectedClassData.students.length} students
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Current date: {new Date().toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedClassData.students.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No students on OD</h3>
                    <p>All students in {selectedClass} are present today.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedClassData.students.map((student) => (
                      <Card key={student.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <h4 className="font-medium text-foreground">{student.name}</h4>
                              <p className="text-sm text-muted-foreground">ID: {student.id}</p>
                            </div>
                            
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">{student.eventName}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  <span>{getPeriodText(student.fromPeriod, student.toPeriod)}</span>
                                </div>
                              </div>
                              
                              <Badge variant="outline" className="w-fit">
                                On Duty
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* All Classes Overview */}
          {!selectedClass && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  All Classes Overview
                </CardTitle>
                <CardDescription>
                  Quick overview of OD status across all classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {classesData.map((classData) => (
                    <Card 
                      key={classData.className}
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        classData.students.length > 0 ? 'border-primary/20' : ''
                      }`}
                      onClick={() => setSelectedClass(classData.className)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-foreground">{classData.className}</h4>
                            <p className="text-sm text-muted-foreground">
                              {classData.students.length === 0 
                                ? "All present" 
                                : `${classData.students.length} on OD`
                              }
                            </p>
                          </div>
                          {classData.students.length > 0 && (
                            <Badge variant="warning">
                              {classData.students.length}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
    </Layout>
  );
};

export default FacultyDashboard;