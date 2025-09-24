import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Clock, BookOpen, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

interface ODRequest {
  id: string;
  student_name: string;
  student_id: string;
  student_year: string;
  student_department: string;
  student_section: string;
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
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [approvedRequests, setApprovedRequests] = useState<ODRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    fetchApprovedRequests();
  }, []);

  const fetchApprovedRequests = async (date?: string) => {
    try {
      let query = supabase
        .from('od_requests')
        .select('*')
        .eq('status', 'hod_approved') // Faculty only sees HOD approved requests
        .order('created_at', { ascending: false });

      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query;

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
    const classes = [
      "1st Year CSE A", "1st Year CSE B", "1st Year ECE A", "1st Year ECE B",
      "2nd Year CSE A", "2nd Year CSE B", "2nd Year ECE A", "2nd Year ECE B", 
      "3rd Year CSE A", "3rd Year CSE B", "3rd Year ECE A", "3rd Year ECE B",
      "4th Year CSE A", "4th Year CSE B", "4th Year ECE A", "4th Year ECE B"
    ];
    
    return classes.map(className => ({
      className,
      students: approvedRequests.filter(req => {
        const fullClass = `${req.student_year} ${req.student_department} ${req.student_section}`;
        return fullClass === className;
      })
    }));
  }, [approvedRequests]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setLoading(true);
    fetchApprovedRequests(date);
  };

  const getPeriodText = (from: number, to: number) => {
    if (from === to) {
      return `Period ${from}`;
    }
    return `Period ${from} to ${to}`;
  };

  const selectedClassData = classesData.find(c => c.className === selectedClass);
  const totalODStudents = classesData.reduce((sum, cls) => sum + cls.students.length, 0);

  return (
    <Layout title="Faculty Dashboard">
      <div className="flex items-center justify-between mb-6">
        <div className="text-muted-foreground">Welcome to the Faculty Portal!</div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Home
        </Button>
      </div>
      <div className="space-y-6">
        {/* Date Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Filter Options
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Filter by Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-48"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class">Select Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-60">
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
            </div>
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
                    <p>No students in {selectedClass} are on OD today.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedClassData.students.map((student) => (
                      <Card key={student.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <h4 className="font-medium text-foreground">{student.student_name}</h4>
                              <p className="text-sm text-muted-foreground">Registration: {student.student_id}</p>
                              <p className="text-sm text-muted-foreground">{student.student_year} {student.student_department} {student.student_section}</p>
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
                                      onClick={async () => {
                                        try {
                                          const { data, error } = await supabase.storage
                                            .from('od-documents')
                                            .createSignedUrl(student.supporting_document_url!, 3600);
                                          
                                          if (error) throw error;
                                          window.open(data.signedUrl, '_blank');
                                        } catch (error) {
                                          console.error('Failed to access supporting document:', error);
                                        }
                                      }}
                                    >
                                      <FileText className="w-4 h-4 mr-1" />
                                      Support Doc
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                      try {
                                        const { data, error } = await supabase.storage
                                          .from('od-documents')
                                          .createSignedUrl(student.proof_document_url, 3600);
                                        
                                        if (error) throw error;
                                        window.open(data.signedUrl, '_blank');
                                      } catch (error) {
                                        console.error('Failed to access proof document:', error);
                                      }
                                    }}
                                  >
                                    <FileText className="w-4 h-4 mr-1" />
                                    Proof Doc
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
                  {selectedDate ? `Classes with OD students on ${new Date(selectedDate).toLocaleDateString()}` : `Classes with OD students today`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {classesData.filter(classData => classData.students.length > 0).map((classData) => (
                    <Card 
                      key={classData.className}
                      className="cursor-pointer hover:shadow-md transition-shadow border-primary/20"
                      onClick={() => setSelectedClass(classData.className)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                           <div>
                             <h4 className="font-medium text-foreground">{classData.className}</h4>
                             <p className="text-sm text-muted-foreground">
                               {classData.students.length} students on OD
                             </p>
                           </div>
                          <Badge variant="warning">
                            {classData.students.length}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {classesData.filter(classData => classData.students.length > 0).length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No students on OD</h3>
                      <p>{selectedDate ? 'No students were on OD on the selected date.' : 'No students are on OD today.'}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
    </Layout>
  );
};

export default FacultyDashboard;