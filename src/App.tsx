import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useBeginnerModeState, BeginnerModeContext } from "@/hooks/useBeginnerMode";
import { lazy, Suspense } from "react";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy-loaded pages
const CalculatorsHub = lazy(() => import("./pages/CalculatorsHub"));
const RatingCurvePage = lazy(() => import("./pages/calculators/RatingCurvePage"));
const CulvertPage = lazy(() => import("./pages/calculators/CulvertPage"));
const FroudePage = lazy(() => import("./pages/calculators/FroudePage"));
const GVFPage = lazy(() => import("./pages/calculators/GVFPage"));
const WeirPage = lazy(() => import("./pages/calculators/WeirPage"));
const CompoundPage = lazy(() => import("./pages/calculators/CompoundPage"));
const HydraulicJumpPage = lazy(() => import("./pages/calculators/HydraulicJumpPage"));
const LearnPathwayPage = lazy(() => import("./pages/learn/LearnPathwayPage"));
const ConceptsPage = lazy(() => import("./pages/reference/ConceptsPage"));
const RubyScriptsPage = lazy(() => import("./pages/reference/RubyScriptsPage"));
const SuDSPage = lazy(() => import("./pages/reference/SuDSPage"));
const SWMMShapesPage = lazy(() => import("./pages/reference/SWMMShapesPage"));
const TroubleshootingPage = lazy(() => import("./pages/TroubleshootingPage"));
const StoryPage = lazy(() => import("./pages/StoryPage"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="flex items-center justify-center py-32">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const AppContent = () => {
  const beginnerModeState = useBeginnerModeState();

  return (
    <BeginnerModeContext.Provider value={beginnerModeState}>
      <Layout>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/calculators" element={<CalculatorsHub />} />
            <Route path="/calculators/rating-curve" element={<RatingCurvePage />} />
            <Route path="/calculators/culvert" element={<CulvertPage />} />
            <Route path="/calculators/froude" element={<FroudePage />} />
            <Route path="/calculators/gvf" element={<GVFPage />} />
            <Route path="/calculators/weir" element={<WeirPage />} />
            <Route path="/calculators/compound" element={<CompoundPage />} />
            <Route path="/calculators/hydraulic-jump" element={<HydraulicJumpPage />} />
            <Route path="/learn/:pathwayId" element={<LearnPathwayPage />} />
            <Route path="/reference/concepts" element={<ConceptsPage />} />
            <Route path="/reference/ruby-scripts" element={<RubyScriptsPage />} />
            <Route path="/reference/suds" element={<SuDSPage />} />
            <Route path="/reference/swmm-shapes" element={<SWMMShapesPage />} />
            <Route path="/troubleshooting" element={<TroubleshootingPage />} />
            <Route path="/story" element={<StoryPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </BeginnerModeContext.Provider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
