import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import HODDashboard from "./pages/HODDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/hod-dashboard" element={<HODDashboard />} />
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
