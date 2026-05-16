import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ListProvider } from "./hooks/use-list";
import { AuthProvider, useAuth } from "./hooks/auth-context";
import { DramaModalProvider } from "./hooks/use-drama-modal";
import { useState } from "react";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import AdminDashboard from "@/pages/AdminDashboard";
import TopRated from "@/pages/TopRated";
import ActorProfile from "@/pages/ActorProfile";
import Social from "@/pages/Social";
import UserProfile from "@/pages/UserProfile";
import News from "@/pages/News";
import NotFound from "@/pages/NotFound";
import MyDramaListPublic from "@/pages/MyDramaListPublic";
import DramaDetail from "@/pages/DramaDetail";
import { PublicListPage } from "@/pages/PublicListPage";
import DramaDetailModal from "./components/DramaDetailModal";
import OnboardingTour from "./components/OnboardingTour";
import OnboardingModal from "./components/OnboardingModal";
import MbtiQuiz from "@/pages/MbtiQuiz";
import VerifyOTP from "@/pages/VerifyOTP";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import CookiePolicy from "@/pages/CookiePolicy";
import ContactUs from "@/pages/ContactUs";

const queryClient = new QueryClient();

// Inner component that can access auth context
const AppContent = () => {
  const { user, showOnboarding, completeOnboarding } = useAuth();
  // Step: 'genre' -> 'tour' -> done
  const [onboardingStep, setOnboardingStep] = useState<'genre' | 'tour'>('genre');

  const handleGenreComplete = () => {
    // Move to tour after genre selection
    setOnboardingStep('tour');
  };

  const handleTourComplete = () => {
    // Complete the full onboarding
    completeOnboarding();
    setOnboardingStep('genre'); // Reset for next time
  };

  return (
    <>
      <Toaster />
      <Sonner />
      <DramaDetailModal />

      {/* Genre Selection Modal - shows first for new users */}
      {showOnboarding && user && onboardingStep === 'genre' && (
        <OnboardingModal
          open={true}
          onComplete={handleGenreComplete}
        />
      )}

      {/* Onboarding Tour - shows after genre selection */}
      {showOnboarding && user && onboardingStep === 'tour' && (
        <OnboardingTour
          username={user.username}
          onComplete={handleTourComplete}
        />
      )}

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/top-rated" element={<TopRated />} />
        <Route path="/social" element={<Social />} />
        <Route path="/user/:username" element={<UserProfile />} />
        <Route path="/actor/:id" element={<ActorProfile />} />
        <Route path="/news" element={<News />} />
        <Route path="/personality-quiz" element={<MbtiQuiz />} />
        <Route path="/list/:shareToken" element={<MyDramaListPublic />} />
        <Route path="/lists/:id" element={<PublicListPage />} />
        <Route path="/drama/:idOrSlug" element={<DramaDetail />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

import { ThemeProvider } from "./components/theme-provider";
import ScrollToTop from "./components/ScrollToTop";

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
            <ListProvider>
              <DramaModalProvider>
                <TooltipProvider>
                  <AppContent />
                </TooltipProvider>
              </DramaModalProvider>
            </ListProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider >
);

export default App;
