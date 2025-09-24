import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText, Plus, Home, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";

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
  class_in_charge: string;
  supporting_document_url?: string;
  proof_document_url: string;
  status: "pending" | "class_approved" | "hod_approved" | "rejected";
  created_at: string;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [myRequests, setMyRequests] = useState<ODRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    student_name: "",
    student_id: "",
    student_year: "",
    student_department: "",
    student_section: "",
    event_name: "",
    date: "",
    from_period: "",
    to_period: "",
    reason: "",
    class_in_charge: ""
  });

  const [supportingFile, setSupportingFile] = useState<File | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('od_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyRequests((data || []) as ODRequest[]);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('od-documents')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    return filePath;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!proofFile) {
      toast({
        title: "Error",
        description: "Proof document is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      // Upload files
      let supportingDocUrl = null;
      if (supportingFile) {
        supportingDocUrl = await uploadFile(supportingFile, 'supporting');
      }
      
      const proofDocUrl = await uploadFile(proofFile, 'proof');

      // Submit the request
      const { data, error } = await supabase
        .from('od_requests')
        .insert([{
          ...formData,
          from_period: parseInt(formData.from_period),
          to_period: parseInt(formData.to_period),
          supporting_document_url: supportingDocUrl,
          proof_document_url: proofDocUrl,
          status: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "OD request submitted successfully!",
        variant: "default"
      });

      // Reset form
      setFormData({
        student_name: "",
        student_id: "",
        student_year: "",
        student_department: "",
        student_section: "",
        event_name: "",
        date: "",
        from_period: "",
        to_period: "",
        reason: "",
        class_in_charge: ""
      });
      setSupportingFile(null);
      setProofFile(null);
      setShowForm(false);
      fetchMyRequests();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'class_approved':
        return <Badge variant="secondary">Class In Charge Approved</Badge>;
      case 'hod_approved':
        return <Badge variant="default">HOD Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout title="Student Dashboard">
      <div className="space-y-6">
        {/* Header with Home Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Welcome to Student Portal</h2>
            <p className="text-muted-foreground">Submit and track your OD requests</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {showForm ? 'Cancel' : 'New OD Request'}
            </Button>
          </div>
        </div>

        {/* OD Request Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Submit OD Request</CardTitle>
              <CardDescription>Fill in all the details for your On Duty request</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Student Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student_name">Full Name *</Label>
                    <Input
                      id="student_name"
                      value={formData.student_name}
                      onChange={(e) => handleInputChange('student_name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student_id">Registration Number *</Label>
                    <Input
                      id="student_id"
                      value={formData.student_id}
                      onChange={(e) => handleInputChange('student_id', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student_year">Year *</Label>
                    <Select value={formData.student_year} onValueChange={(value) => handleInputChange('student_year', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Year" />
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
                    <Label htmlFor="student_department">Department *</Label>
                    <Select value={formData.student_department} onValueChange={(value) => handleInputChange('student_department', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CSE">Computer Science Engineering</SelectItem>
                        <SelectItem value="ECE">Electronics and Communication Engineering</SelectItem>
                        <SelectItem value="EEE">Electrical and Electronics Engineering</SelectItem>
                        <SelectItem value="MECH">Mechanical Engineering</SelectItem>
                        <SelectItem value="CIVIL">Civil Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student_section">Section *</Label>
                    <Select value={formData.student_section} onValueChange={(value) => handleInputChange('student_section', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class_in_charge">Class In Charge *</Label>
                    <Select value={formData.class_in_charge} onValueChange={(value) => handleInputChange('class_in_charge', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Class In Charge" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dr. Priya Sharma">Dr. Priya Sharma</SelectItem>
                        <SelectItem value="Prof. Rajesh Kumar">Prof. Rajesh Kumar</SelectItem>
                        <SelectItem value="Dr. Meera Patel">Dr. Meera Patel</SelectItem>
                        <SelectItem value="Prof. Ankit Singh">Prof. Ankit Singh</SelectItem>
                        <SelectItem value="Dr. Sunita Rao">Dr. Sunita Rao</SelectItem>
                        <SelectItem value="Prof. Vikram Gupta">Prof. Vikram Gupta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="event_name">Event Name *</Label>
                    <Input
                      id="event_name"
                      value={formData.event_name}
                      onChange={(e) => handleInputChange('event_name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="from_period">From Period *</Label>
                      <Select value={formData.from_period} onValueChange={(value) => handleInputChange('from_period', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Period" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
                            <SelectItem key={period} value={period.toString()}>
                              Period {period}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="to_period">To Period *</Label>
                      <Select value={formData.to_period} onValueChange={(value) => handleInputChange('to_period', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Period" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
                            <SelectItem key={period} value={period.toString()}>
                              Period {period}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for OD *</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => handleInputChange('reason', e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supporting_document">Supporting Document (Optional)</Label>
                    <Input
                      id="supporting_document"
                      type="file"
                      onChange={(e) => setSupportingFile(e.target.files?.[0] || null)}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proof_document">Proof Document *</Label>
                    <Input
                      id="proof_document"
                      type="file"
                      onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={loading || uploading} className="flex-1">
                    {uploading ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-spin" />
                        Uploading Files...
                      </>
                    ) : loading ? (
                      'Submitting...'
                    ) : (
                      'Submit OD Request'
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* My Requests */}
        <Card>
          <CardHeader>
            <CardTitle>My OD Requests</CardTitle>
            <CardDescription>Track the status of your submitted requests</CardDescription>
          </CardHeader>
          <CardContent>
            {myRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No requests yet</h3>
                <p>Submit your first OD request using the button above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map((request) => (
                  <Card key={request.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-medium text-foreground">{request.event_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(request.date).toLocaleDateString()} | 
                            Period {request.from_period} to {request.to_period}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Class In Charge: {request.class_in_charge}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(request.status)}
                          <div className="text-xs text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString()}
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
      </div>
    </Layout>
  );
};

export default StudentDashboard;