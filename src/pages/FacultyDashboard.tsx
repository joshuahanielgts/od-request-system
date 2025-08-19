import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Clock, BookOpen, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";

interface ODRequest {
  id: string;
  student_name: string;
  student_id: string;
  student_class: string;
  event_name: string;
  date: string;
  from_period: number;
  to_period: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  supporting_document_url?: string;
  proof_document_url: string;
  updated_at: string;
}

interface ClassData {
  className: string;
  students: ODRequest[];
}

const FacultyDashboard = () => {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [approvedRequests, setApprovedRequests] = useState<ODRequest[]>([]);
  const [loading, setLoading] = useState(true);
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
    fetchApprovedRequests();
  }, [user, navigate]);

  const fetchApprovedRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('od_requests')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApprovedRequests((data || []) as ODRequest[]);
    } catch (error) {
      console.error('Error fetching approved requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group approved requests by class
  const classesData: ClassData[] = React.useMemo(() => {
    const classes = ["I CSE A", "I CSE B", "II CSE A", "II CSE B", "III CSE A", "III CSE B", "IV CSE A", "IV CSE B"];
    
    return classes.map(className => ({
      className,
      students: approvedRequests.filter(req => req.student_class === className)
    }));
  }, [approvedRequests]);

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
                              <h4 className="font-medium text-foreground">{student.student_name}</h4>
                              <p className="text-sm text-muted-foreground">ID: {student.student_id}</p>
                            </div>
                            
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                 <div className="space-y-1">
                                 <p className="text-sm font-medium text-foreground">{student.event_name}</p>
                                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                   <Clock className="w-4 h-4" />
                                   <span>{getPeriodText(student.from_period, student.to_period)}</span>
                                 </div>
                               </div>
                               
                               <div className="flex items-center gap-2">
                                 <Badge variant="outline" className="w-fit">
                                   On Duty
                                 </Badge>
                                 <div className="flex gap-1">
                                   {student.supporting_document_url && (
                                     <Button
                                       variant="outline"
                                       size="sm"
                                       onClick={() => window.open(`${supabase.storage.from('od-documents').getPublicUrl(student.supporting_document_url!).data.publicUrl}`, '_blank')}
                                     >
                                       <FileText className="w-4 h-4" />
                                     </Button>
                                   )}
                                   <Button
                                     variant="outline"
                                     size="sm"
                                     onClick={() => window.open(`${supabase.storage.from('od-documents').getPublicUrl(student.proof_document_url).data.publicUrl}`, '_blank')}
                                   >
                                     <FileText className="w-4 h-4" />
                                   </Button>
                                 </div>
                               </div>
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
                             {classData.students.length > 0 && (
                               <p className="text-sm text-muted-foreground">
                                 {classData.students.length} on OD
                               </p>
                             )}
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