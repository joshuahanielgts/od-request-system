-- Create users table with provided credentials
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'hod', 'faculty')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" 
ON public.users 
FOR SELECT 
USING (auth.uid()::text = id::text);

-- Insert student credentials
INSERT INTO public.users (username, password, name, role) VALUES
('rs5483', 'Rohit@002', 'Rohit Vikkranth S', 'student'),
('vv7533', 'Vinaya@004', 'Vinaya VR', 'student'),
('sb1995', 'Surya@005', 'Suryaprakasham', 'student'),
('nj6187', 'Nilesh@007', 'Nilesh J', 'student'),
('ac3881', 'Ashwin@011', 'Ashwin', 'student'),
('mn0024', 'Ihsan@013', 'Mohammed Ihsan N', 'student'),
('sk8027', 'Shanmathi@015', 'Shanmathi K', 'student'),
('ad0561', 'Asritha@017', 'Ashritha', 'student'),
('ry9932', 'Roshni@018', 'Roshini', 'student'),
('jk7808', 'Jai@020', 'Jaivigensh', 'student'),
('vg6422', 'Vaasavi@022', 'Vaasavi', 'student'),
('sl2359', 'Sai@023', 'Sai Shivaram', 'student'),
('aj2075', 'Athish@025', 'Athish Kirthik JD', 'student'),
('rg0134', 'Radhika@026', 'Radhika Ganesh', 'student'),
('pk7960', 'Pranav@032', 'Koduri Pranav', 'student'),
('sk1897', 'Sirushti@037', 'Sirushti', 'student'),
('sr6160', 'Sharan@038', 'R Sharan', 'student'),
('ss1492', 'Tharun@040', 'Tharun Kumaar SD', 'student'),
('cv1432', 'Caroline@043', 'Caroline Vineeta', 'student'),
('vr3569', 'Venkat@044', 'Venkatapathy', 'student'),
('mb1109', 'Mani@045', 'Mani SHankar', 'student'),
('as2353', 'Arjun@046', 'Arjun KS', 'student'),
('cr7821', 'Charu@048', 'Charu Nethra', 'student'),
('vs7190', 'Vedika@049', 'Vedika Singh', 'student'),
('ar6917', 'Archana@050', 'Archana R', 'student'),
('dr1571', 'Divya@052', 'Divya', 'student'),
('ss8795', 'Sharan@053', 'S Sharan', 'student'),
('sm0343', 'Senthil@054', 'Senthil Nathan', 'student'),
('ss8045', 'Samiksha@055', 'Samiksha', 'student'),
('jj9568', 'Joshua@056', 'J Joshua Haniel', 'student'),
('gv2212', 'Deepti@058', 'Deepti Varsha', 'student'),
('sk8361', 'Sneha@059', 'Sneha Kumari', 'student'),
('gr3026', 'Gautam@060', 'Gautam', 'student'),
('sr3590', 'Shreya@061', 'Shreya', 'student'),
('sg3142', 'Sai@062', 'Sai Siva Ganesh', 'student'),
('ss1833', 'Sricharan@063', 'Sricharan', 'student'),
('jc8930', 'Jithin@064', 'Jithin CM', 'student'),
('aa1142', 'Arjun@067', 'Arjun Ashkar', 'student'),
('ps1770', 'Priangshu@068', 'Priangshu', 'student'),
('jd9812', 'Janardhan@069', 'Janardhan D', 'student'),
('am4696', 'Anoop@070', 'Anoop Mahesh', 'student'),
('ag2008', 'Akshaya@073', 'Akshaya G', 'student'),
('ts0372', 'Tamizhselvan@075', 'Tamizhselvan', 'student'),
('ps2881', 'Prateek@080', 'Prateek Sharma', 'student'),
('rg5749', 'Rohith@083', 'Rohith G', 'student'),
('rr9014', 'Raj@086', 'Raj Ratna Rana', 'student'),
('sd6403', 'Sadhana@094', 'Sadhana S', 'student'),
('ml6167', 'Milendra@095', 'Milendra Labana', 'student'),
('nb6703', 'Nisha@099', 'Nishanthini', 'student'),
('sm6568', 'Annie@100', 'Annie Maragaret', 'student'),
('rm5260', 'Rohith@102', 'Rohith M', 'student'),
('jj5237', 'Jeyanirudh@103', 'Jeyanirudh', 'student'),
('as2532', 'Arjun@104', 'Arjun Singh', 'student'),
('kc2771', 'Kethaki@108', 'Kethaki Chelli', 'student'),
('ss4085', 'Surya@111', 'Surya Sivakumar', 'student'),
('as0440', 'Anshika@112', 'Anshika Shukla', 'student'),
('ys7013', 'Yashwant@116', 'Yashwant S', 'student');

-- Insert HOD credentials
INSERT INTO public.users (username, password, name, role) VALUES
('hod@srm', 'Hod@2025', 'Dr. Golda Dilip', 'hod');

-- Insert Faculty credentials
INSERT INTO public.users (username, password, name, role) VALUES
('Durgadevi', 'Durgadevi@2025', 'Mrs. Durgadevi', 'faculty');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();