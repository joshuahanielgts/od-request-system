-- Add new columns for year, department, section and remove class column
ALTER TABLE public.od_requests 
DROP COLUMN student_class,
ADD COLUMN student_year TEXT NOT NULL DEFAULT '',
ADD COLUMN student_department TEXT NOT NULL DEFAULT '',
ADD COLUMN student_section TEXT NOT NULL DEFAULT '';

-- Add index for better performance on date queries
CREATE INDEX idx_od_requests_date ON public.od_requests(date);
CREATE INDEX idx_od_requests_status_date ON public.od_requests(status, date);