import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, FileText, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";

interface ODRequest {
  id: string;
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

const StudentDashboard = () => {
  const [requests, setRequests] = useState<ODRequest[]>([
    {
      id: "1",
      eventName: "Tech Symposium",
      date: "2024-03-15",
      startTime: "09:00",
      endTime: "17:00",
      reason: "Participating in technical paper presentation",
      status: "approved",
      submittedAt: "2024-03-10"
    },
    {
      id: "2",
      eventName: "Workshop on AI",
      date: "2024-03-20",
      startTime: "10:00",
      endTime: "16:00",
      reason: "Attending machine learning workshop for skill development",
      status: "pending",
      submittedAt: "2024-03-12"
    }
  ]);

  const [newRequest, setNewRequest] = useState({
    eventName: "",
    date: "",
    startTime: "",
    endTime: "",
    reason: ""
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
  }, [user, navigate]);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRequest.eventName || !newRequest.date || !newRequest.startTime || !newRequest.endTime || !newRequest.reason) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    const request: ODRequest = {
      id: Date.now().toString(),
      ...newRequest,
      status: "pending",
      submittedAt: new Date().toISOString().split('T')[0]
    };

    setRequests(prev => [request, ...prev]);
    setNewRequest({
      eventName: "",
      date: "",
      startTime: "",
      endTime: "",
      reason: ""
    });
    setDialogOpen(false);

    toast({
      title: "Request Submitted",
      description: "Your OD request has been submitted successfully"
    });
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
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name *</Label>
                <Input
                  id="eventName"
                  placeholder="Enter event name"
                  value={newRequest.eventName}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, eventName: e.target.value }))}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newRequest.startTime}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newRequest.endTime}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, endTime: e.target.value }))}
                  />
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
              <Button type="submit" className="w-full">
                Submit Request
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
                      <CardTitle className="text-lg">{request.eventName}</CardTitle>
                      <Badge variant={getStatusColor(request.status) as any}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {request.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {request.startTime} - {request.endTime}
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
                      <CardTitle className="text-lg">{request.eventName}</CardTitle>
                      <Badge variant="success">
                        Approved
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {request.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {request.startTime} - {request.endTime}
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
                      <CardTitle className="text-lg">{request.eventName}</CardTitle>
                      <Badge variant="destructive">
                        Rejected
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {request.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {request.startTime} - {request.endTime}
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