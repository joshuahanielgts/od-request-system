-- Create OD requests table
CREATE TABLE public.od_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_class TEXT NOT NULL,
  event_name TEXT NOT NULL,
  date DATE NOT NULL,
  from_period INTEGER NOT NULL CHECK (from_period >= 1 AND from_period <= 7),
  to_period INTEGER NOT NULL CHECK (to_period >= 1 AND to_period <= 7 AND to_period >= from_period),
  reason TEXT NOT NULL,
  supporting_document_url TEXT,
  proof_document_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.od_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read and insert (since we don't have auth)
CREATE POLICY "Allow all operations on od_requests" 
ON public.od_requests 
FOR ALL 
USING (true);

-- Create storage buckets for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
('od-documents', 'od-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']);

-- Create storage policies
CREATE POLICY "Allow all operations on od-documents" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'od-documents');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_od_requests_updated_at
BEFORE UPDATE ON public.od_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();