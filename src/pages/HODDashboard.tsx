import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, User, CheckCircle, XCircle, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ODRequest {
  id: string;
  studentName: string;
  studentId: string;
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

const HODDashboard = () => {
  const [requests, setRequests] = useState<ODRequest[]>([
    {
      id: "1",
      studentName: "John Doe",
      studentId: "CS21001",
      eventName: "Tech Symposium",
      date: "2024-03-15",
      startTime: "09:00",
      endTime: "17:00",
      reason: "Participating in technical paper presentation on Machine Learning applications in healthcare",
      status: "pending",
      submittedAt: "2024-03-10"
    },
    {
      id: "2",
      studentName: "Jane Smith",
      studentId: "CS21002",
      eventName: "Workshop on AI",
      date: "2024-03-20",
      startTime: "10:00",
      endTime: "16:00",
      reason: "Attending comprehensive machine learning workshop for advanced skill development",
      status: "pending",
      submittedAt: "2024-03-12"
    },
    {
      id: "3",
      studentName: "Mike Johnson",
      studentId: "CS21003",
      eventName: "Coding Competition",
      date: "2024-03-18",
      startTime: "08:00",
      endTime: "18:00",
      reason: "Participating in inter-college coding competition representing our institution",
      status: "pending",
      submittedAt: "2024-03-13"
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState<ODRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRequestAction = (requestId: string, action: "approved" | "rejected") => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: action } : req
    ));

    const request = requests.find(r => r.id === requestId);
    toast({
      title: `Request ${action}`,
      description: `${request?.studentName}'s OD request has been ${action}`,
      variant: action === "approved" ? "default" : "destructive"
    });

    setDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleRequestClick = (request: ODRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const pendingRequests = requests.filter(r => r.status === "pending");

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">HOD Dashboard</h1>
              <p className="text-muted-foreground">Review and manage OD requests</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Pending Approvals ({pendingRequests.length})
            </h2>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span>Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>
                <span>Rejected</span>
              </div>
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success" />
                  <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                  <p>No pending OD requests at the moment.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRequests.map((request) => (
                <Card 
                  key={request.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => handleRequestClick(request)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {request.studentName}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {request.studentId}
                        </CardDescription>
                      </div>
                      <Badge variant="warning">
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium text-foreground">{request.eventName}</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {request.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {request.startTime} - {request.endTime}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {request.reason}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Submitted: {request.submittedAt}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Request Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {selectedRequest.studentName} - OD Request
                </DialogTitle>
                <DialogDescription>
                  Student ID: {selectedRequest.studentId} | Submitted: {selectedRequest.submittedAt}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Event Name</label>
                    <p className="text-sm bg-muted p-3 rounded-md">{selectedRequest.eventName}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Date</label>
                    <p className="text-sm bg-muted p-3 rounded-md">{selectedRequest.date}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Start Time</label>
                    <p className="text-sm bg-muted p-3 rounded-md">{selectedRequest.startTime}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">End Time</label>
                    <p className="text-sm bg-muted p-3 rounded-md">{selectedRequest.endTime}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Reason for OD</label>
                  <p className="text-sm bg-muted p-3 rounded-md min-h-[80px]">{selectedRequest.reason}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => handleRequestAction(selectedRequest.id, "approved")}
                    className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Request
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleRequestAction(selectedRequest.id, "rejected")}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Request
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HODDashboard;