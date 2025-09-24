-- Add class_in_charge column to od_requests table
ALTER TABLE public.od_requests 
ADD COLUMN class_in_charge text NOT NULL DEFAULT '';

-- Update the status values to include the new workflow stages
-- Current values: 'pending', 'approved', 'rejected'
-- New values: 'pending', 'class_approved', 'hod_approved', 'rejected'

-- Create a function to handle workflow notifications (we'll implement this with edge functions)
COMMENT ON COLUMN public.od_requests.class_in_charge IS 'Name of the class in charge teacher responsible for initial approval';
COMMENT ON COLUMN public.od_requests.status IS 'Request status: pending -> class_approved -> hod_approved or rejected at any stage';