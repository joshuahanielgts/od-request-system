import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, FileText, Plus, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";

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
  supporting_document_url?: string;
  proof_document_url: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

const StudentDashboard = () => {
  const [requests, setRequests] = useState<ODRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [newRequest, setNewRequest] = useState({
    eventName: "",
    date: "",
    fromPeriod: "1",
    toPeriod: "1",
    reason: "",
    supportingDocument: null as File | null,
    proofDocument: null as File | null,
    students: [{ studentName: "", registrationNumber: "", year: "", department: "CSE", section: "" }]
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('od_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as ODRequest[]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, type: 'supporting' | 'proof') => {
    const fileName = `${Date.now()}_${type}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('od-documents')
      .upload(fileName, file);

    if (error) throw error;
    return data.path;
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate students
    for (const student of newRequest.students) {
      if (!student.studentName || !student.registrationNumber || !student.year || !student.section) {
        toast({
          title: "Missing Information",
          description: "Please fill in all student details",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (!newRequest.eventName || !newRequest.date || !newRequest.fromPeriod || 
        !newRequest.toPeriod || !newRequest.reason || !newRequest.proofDocument) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Upload proof document (required)
      const proofUrl = await uploadFile(newRequest.proofDocument, 'proof');
      
      // Upload supporting document (optional)
      let supportingUrl = null;
      if (newRequest.supportingDocument) {
        supportingUrl = await uploadFile(newRequest.supportingDocument, 'supporting');
      }

      // Create single request with all students combined
      const allStudents = newRequest.students.map(s => ({
        name: s.studentName,
        registrationNumber: s.registrationNumber,
        year: s.year,
        department: s.department,
        section: s.section
      }));

      const { error } = await supabase
        .from('od_requests')
        .insert({
          student_name: allStudents.map(s => s.name).join(', '),
          student_id: allStudents.map(s => s.registrationNumber).join(', '),
          student_year: allStudents[0].year,
          student_department: "CSE",
          student_section: allStudents[0].section,
          event_name: newRequest.eventName,
          date: newRequest.date,
          from_period: parseInt(newRequest.fromPeriod),
          to_period: parseInt(newRequest.toPeriod),
          reason: newRequest.reason,
          supporting_document_url: supportingUrl,
          proof_document_url: proofUrl
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `OD request(s) submitted successfully for ${newRequest.students.length} student(s)`
      });

      // Reset form
      setNewRequest({
        eventName: "",
        date: "",
        fromPeriod: "1",
        toPeriod: "1",
        reason: "",
        supportingDocument: null,
        proofDocument: null,
        students: [{ studentName: "", registrationNumber: "", year: "", department: "CSE", section: "" }]
      });
      
      setDialogOpen(false);
      fetchRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "success";
      case "rejected": return "destructive";
      default: return "warning";
    }
  };

  const categorizeRequests = () => {
    return {
      pending: requests.filter(r => r.status === "pending"),
      approved: requests.filter(r => r.status === "approved"),
      rejected: requests.filter(r => r.status === "rejected")
    };
  };

  const { pending, approved, rejected } = categorizeRequests();

  const getPeriodText = (from: number, to: number) => {
    if (from === to) {
      return `Period ${from}`;
    }
    return `Period ${from} to ${to}`;
  };

  return (
    <Layout title="Student Dashboard">
      <div className="flex justify-between items-center mb-6">
        <div className="text-muted-foreground">Welcome to the Student Portal!</div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Request OD
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit OD Request</DialogTitle>
              <DialogDescription>
                Fill in the details for your On Duty request
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              {/* Students Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Students</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewRequest(prev => ({
                      ...prev,
                      students: [...prev.students, { studentName: "", registrationNumber: "", year: "", department: "CSE", section: "" }]
                    }))}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                </div>
                
                {newRequest.students.map((student, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Student {index + 1}</h4>
                      {newRequest.students.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewRequest(prev => ({
                            ...prev,
                            students: prev.students.filter((_, i) => i !== index)
                          }))}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input
                          placeholder="Student name"
                          value={student.studentName}
                          onChange={(e) => setNewRequest(prev => ({
                            ...prev,
                            students: prev.students.map((s, i) => 
                              i === index ? { ...s, studentName: e.target.value } : s
                            )
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Registration Number *</Label>
                        <Input
                          placeholder="Registration number"
                          value={student.registrationNumber}
                          onChange={(e) => setNewRequest(prev => ({
                            ...prev,
                            students: prev.students.map((s, i) => 
                              i === index ? { ...s, registrationNumber: e.target.value } : s
                            )
                          }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Year *</Label>
                          <Select 
                            value={student.year} 
                            onValueChange={(value) => setNewRequest(prev => ({
                              ...prev,
                              students: prev.students.map((s, i) => 
                                i === index ? { ...s, year: value, department: "CSE" } : s
                              )
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1st Year">1st Year</SelectItem>
                              <SelectItem value="2nd Year">2nd Year</SelectItem>
                              <SelectItem value="3rd Year">3rd Year</SelectItem>
                              <SelectItem value="4th Year">4th Year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Section *</Label>
                          <Select 
                            value={student.section} 
                            onValueChange={(value) => setNewRequest(prev => ({
                              ...prev,
                              students: prev.students.map((s, i) => 
                                i === index ? { ...s, section: value } : s
                              )
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sec" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newRequest.date}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name *</Label>
                <Input
                  id="eventName"
                  placeholder="Enter event name"
                  value={newRequest.eventName}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, eventName: e.target.value }))}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fromPeriod">From Period *</Label>
                  <Select value={newRequest.fromPeriod} onValueChange={(value) => setNewRequest(prev => ({ ...prev, fromPeriod: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select from period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Period 1</SelectItem>
                      <SelectItem value="2">Period 2</SelectItem>
                      <SelectItem value="3">Period 3</SelectItem>
                      <SelectItem value="4">Period 4</SelectItem>
                      <SelectItem value="5">Period 5</SelectItem>
                      <SelectItem value="6">Period 6</SelectItem>
                      <SelectItem value="7">Period 7</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toPeriod">To Period *</Label>
                  <Select value={newRequest.toPeriod} onValueChange={(value) => setNewRequest(prev => ({ ...prev, toPeriod: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select to period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Period 1</SelectItem>
                      <SelectItem value="2">Period 2</SelectItem>
                      <SelectItem value="3">Period 3</SelectItem>
                      <SelectItem value="4">Period 4</SelectItem>
                      <SelectItem value="5">Period 5</SelectItem>
                      <SelectItem value="6">Period 6</SelectItem>
                      <SelectItem value="7">Period 7</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for OD *</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain the reason for your OD request"
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportingDocument">Supporting Document (Optional)</Label>
                <Input
                  id="supportingDocument"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setNewRequest(prev => ({ ...prev, supportingDocument: e.target.files?.[0] || null }))}
                />
                <p className="text-xs text-muted-foreground">PDF, JPG, PNG files only (max 10MB)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proofDocument">Proof Document *</Label>
                <Input
                  id="proofDocument"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setNewRequest(prev => ({ ...prev, proofDocument: e.target.files?.[0] || null }))}
                />
                <p className="text-xs text-muted-foreground">PDF, JPG, PNG files only (max 10MB)</p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Requests */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" />
              Ongoing Requests ({pending.length})
            </h2>
            {pending.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No pending requests
                </CardContent>
              </Card>
            ) : (
              pending.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{request.event_name}</CardTitle>
                      <Badge variant={getStatusColor(request.status) as any}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(request.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {getPeriodText(request.from_period, request.to_period)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{request.reason}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Approved Requests */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-success" />
              Approved Requests ({approved.length})
            </h2>
            {approved.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No approved requests
                </CardContent>
              </Card>
            ) : (
              approved.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{request.event_name}</CardTitle>
                      <Badge variant="success">
                        Approved
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(request.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {getPeriodText(request.from_period, request.to_period)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{request.reason}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Rejected Requests */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-destructive" />
              Rejected Requests ({rejected.length})
            </h2>
            {rejected.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No rejected requests
                </CardContent>
              </Card>
            ) : (
              rejected.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{request.event_name}</CardTitle>
                      <Badge variant="destructive">
                        Rejected
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(request.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {getPeriodText(request.from_period, request.to_period)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{request.reason}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
    </Layout>
  );
};

export default StudentDashboard;