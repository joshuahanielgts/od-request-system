import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, User, CheckCircle, XCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  supporting_document_url?: string;
  proof_document_url: string;
  status: "pending" | "class_approved" | "hod_approved" | "rejected";
  created_at: string;
  updated_at: string;
}

const HODDashboard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ODRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ODRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async (date?: string) => {
    try {
      let query = supabase
        .from('od_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (date) {
        query = query.eq('date', date);
      } else {
        // Show only class_approved requests for HOD if no date selected
        query = query.eq('status', 'class_approved');
      }

      const { data, error } = await query;

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

  const handleRequestAction = async (requestId: string, action: "hod_approved" | "rejected") => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('od_requests')
        .update({ status: action })
        .eq('id', requestId);

      if (error) throw error;

      const request = requests.find(r => r.id === requestId);
      const message = action === "hod_approved" 
        ? "OD request approved by HOD" 
        : "OD request rejected by HOD";

      toast({
        title: `Request ${action === "hod_approved" ? "Approved" : "Rejected"}`,
        description: `${request?.student_name}'s request: ${message}`,
        variant: action === "hod_approved" ? "default" : "destructive"
      });

      setDialogOpen(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestClick = (request: ODRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setLoading(true);
    fetchRequests(date);
  };

  const filteredRequests = selectedDate ? requests : requests.filter(r => r.status === "class_approved");

  const getPeriodText = (from: number, to: number) => {
    if (from === to) {
      return `Period ${from}`;
    }
    return `Period ${from} to ${to}`;
  };

  return (
    <Layout title="HOD Dashboard">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {selectedDate ? `Requests for ${new Date(selectedDate).toLocaleDateString()}` : `Class Approved Requests`} ({filteredRequests.length})
            </h2>
            <p className="text-muted-foreground">Welcome to the HOD Portal!</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
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
          </div>
        </div>

          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success" />
                  <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                  <p>No requests pending for your approval at the moment.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((request) => (
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
                          {request.student_name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {request.student_id} | {request.student_year} {request.student_department} {request.student_section}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        request.status === 'class_approved' ? 'secondary' : 
                        request.status === 'hod_approved' ? 'default' : 'destructive'
                      }>
                        {request.status === 'class_approved' ? 'Approved by Class In Charge' : 
                         request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium text-foreground">{request.event_name}</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(request.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {getPeriodText(request.from_period, request.to_period)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {request.reason}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Submitted: {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      {/* Request Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {selectedRequest.student_name} - OD Request
                </DialogTitle>
                <DialogDescription>
                  Registration: {selectedRequest.student_id} | {selectedRequest.student_year} {selectedRequest.student_department} {selectedRequest.student_section} | Submitted: {new Date(selectedRequest.created_at).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Event Name</label>
                    <p className="text-sm bg-muted p-3 rounded-md">{selectedRequest.event_name}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Date</label>
                    <p className="text-sm bg-muted p-3 rounded-md">{new Date(selectedRequest.date).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">From Period</label>
                    <p className="text-sm bg-muted p-3 rounded-md">{getPeriodText(selectedRequest.from_period, selectedRequest.from_period)}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">To Period</label>
                    <p className="text-sm bg-muted p-3 rounded-md">{getPeriodText(selectedRequest.to_period, selectedRequest.to_period)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Reason for OD</label>
                  <p className="text-sm bg-muted p-3 rounded-md min-h-[80px]">{selectedRequest.reason}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground">Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRequest.supporting_document_url && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Supporting Document</label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={async () => {
                            try {
                              const { data, error } = await supabase.storage
                                .from('od-documents')
                                .createSignedUrl(selectedRequest.supporting_document_url!, 3600);
                              
                              if (error) throw error;
                              window.open(data.signedUrl, '_blank');
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to access document",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Document
                        </Button>
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Proof Document</label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={async () => {
                          try {
                            const { data, error } = await supabase.storage
                              .from('od-documents')
                              .createSignedUrl(selectedRequest.proof_document_url, 3600);
                            
                            if (error) throw error;
                            window.open(data.signedUrl, '_blank');
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to access document",
                              variant: "destructive"
                            });
                          }
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Document
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  {selectedRequest.status === 'class_approved' && (
                    <>
                      <Button
                        onClick={() => handleRequestAction(selectedRequest.id, "hod_approved")}
                        className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                        disabled={loading}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {loading ? "Processing..." : "Approve Request"}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleRequestAction(selectedRequest.id, "rejected")}
                        className="flex-1"
                        disabled={loading}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {loading ? "Processing..." : "Reject Request"}
                      </Button>
                    </>
                  )}
                  {selectedRequest.status !== 'class_approved' && (
                    <div className="flex-1 text-center p-4 bg-muted rounded-lg">
                      <Badge variant={selectedRequest.status === 'hod_approved' ? 'default' : 'destructive'} className="text-sm">
                        Request {selectedRequest.status === 'hod_approved' ? 'Approved by HOD' : selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default HODDashboard;