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
    studentName: "",
    studentId: "",
    studentClass: "",
    eventName: "",
    date: "",
    fromPeriod: "",
    toPeriod: "",
    reason: "",
    supportingDocument: null as File | null,
    proofDocument: null as File | null
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    if (user.role !== 'student') {
      navigate('/');
      return;
    }
    fetchRequests();
  }, [user, navigate]);

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
    
    if (!newRequest.studentName || !newRequest.studentId || !newRequest.studentClass || 
        !newRequest.eventName || !newRequest.date || !newRequest.fromPeriod || 
        !newRequest.toPeriod || !newRequest.reason || !newRequest.proofDocument) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields and upload proof document",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Upload documents
      const proofPath = await uploadFile(newRequest.proofDocument, 'proof');
      let supportingPath = null;
      
      if (newRequest.supportingDocument) {
        supportingPath = await uploadFile(newRequest.supportingDocument, 'supporting');
      }

      // Insert request
      const { error } = await supabase
        .from('od_requests')
        .insert({
          student_name: newRequest.studentName,
          student_id: newRequest.studentId,
          student_class: newRequest.studentClass,
          event_name: newRequest.eventName,
          date: newRequest.date,
          from_period: parseInt(newRequest.fromPeriod),
          to_period: parseInt(newRequest.toPeriod),
          reason: newRequest.reason,
          supporting_document_url: supportingPath,
          proof_document_url: proofPath
        });

      if (error) throw error;

      setNewRequest({
        studentName: "",
        studentId: "",
        studentClass: "",
        eventName: "",
        date: "",
        fromPeriod: "",
        toPeriod: "",
        reason: "",
        supportingDocument: null,
        proofDocument: null
      });
      setDialogOpen(false);

      toast({
        title: "Request Submitted",
        description: "Your OD request has been submitted successfully"
      });

      fetchRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request",
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
    const getOrdinal = (n: number) => {
      const suffixes = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
    };
    
    if (from === to) {
      return `${getOrdinal(from)} period`;
    }
    return `${getOrdinal(from)} to ${getOrdinal(to)} period`;
  };

  if (!user) {
    return null; // Will redirect
  }

  return (
    <Layout title="Student Dashboard">
      <div className="flex justify-between items-center mb-6">
        <div className="text-muted-foreground">Welcome back, {user.name}!</div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Request OD
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Submit OD Request</DialogTitle>
              <DialogDescription>
                Fill in the details for your On Duty request
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Name *</Label>
                  <Input
                    id="studentName"
                    placeholder="Enter your name"
                    value={newRequest.studentName}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, studentName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID *</Label>
                  <Input
                    id="studentId"
                    placeholder="Enter your student ID"
                    value={newRequest.studentId}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, studentId: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentClass">Class *</Label>
                  <Input
                    id="studentClass"
                    placeholder="e.g., I CSE A"
                    value={newRequest.studentClass}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, studentClass: e.target.value }))}
                  />
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromPeriod">From Period *</Label>
                  <Select value={newRequest.fromPeriod} onValueChange={(value) => setNewRequest(prev => ({ ...prev, fromPeriod: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select from period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Period</SelectItem>
                      <SelectItem value="2">2nd Period</SelectItem>
                      <SelectItem value="3">3rd Period</SelectItem>
                      <SelectItem value="4">4th Period</SelectItem>
                      <SelectItem value="5">5th Period</SelectItem>
                      <SelectItem value="6">6th Period</SelectItem>
                      <SelectItem value="7">7th Period</SelectItem>
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
                      <SelectItem value="5">5th Period</SelectItem>
                      <SelectItem value="7">7th Period</SelectItem>
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