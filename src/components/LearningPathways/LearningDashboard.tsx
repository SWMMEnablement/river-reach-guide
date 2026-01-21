import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Sparkles, TrendingUp } from "lucide-react";
import { PathwayCard, PathwayStep } from "./PathwayCard";
import { learningPathways, sectionTargets } from "./pathwayData";

const STORAGE_KEY = "learning-progress";

interface LearningDashboardProps {
  onNavigateToSection?: (sectionId: string) => void;
}

export const LearningDashboard = ({ onNavigateToSection }: LearningDashboardProps) => {
  const [expandedPathway, setExpandedPathway] = useState<string | null>("get-started");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCompletedSteps(new Set(JSON.parse(saved)));
      }
    } catch (e) {
      console.error("Failed to load progress:", e);
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(completedSteps)));
    } catch (e) {
      console.error("Failed to save progress:", e);
    }
  }, [completedSteps]);

  const handleStepClick = (step: PathwayStep) => {
    // Mark step as completed
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(step.id);
      return next;
    });

    // Navigate to section
    if (step.sectionId && onNavigateToSection) {
      onNavigateToSection(step.sectionId);
    } else if (step.sectionId) {
      const target = sectionTargets[step.sectionId] || step.sectionId;
      const element = document.getElementById(target);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const totalSteps = learningPathways.reduce((sum, p) => sum + p.steps.length, 0);
  const totalCompleted = completedSteps.size;
  const overallProgress = totalSteps > 0 ? Math.round((totalCompleted / totalSteps) * 100) : 0;

  const resetProgress = () => {
    setCompletedSteps(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Header with overall progress */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Learning Pathways</h2>
            <p className="text-sm text-muted-foreground">
              Choose your journey through hydraulic modeling
            </p>
          </div>
        </div>

        {/* Progress summary */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {overallProgress}% Complete
            </span>
            <span className="text-xs text-muted-foreground">
              ({totalCompleted}/{totalSteps} steps)
            </span>
          </div>
          {totalCompleted > 0 && (
            <button
              onClick={resetProgress}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Pathway cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {learningPathways.map((pathway, index) => (
          <motion.div
            key={pathway.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PathwayCard
              pathway={pathway}
              isExpanded={expandedPathway === pathway.id}
              onToggle={() =>
                setExpandedPathway((prev) => (prev === pathway.id ? null : pathway.id))
              }
              onStepClick={handleStepClick}
              completedSteps={completedSteps}
            />
          </motion.div>
        ))}
      </div>

      {/* Encouragement message */}
      {overallProgress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30"
        >
          <Sparkles className="w-6 h-6 text-primary flex-shrink-0" />
          <div>
            <p className="font-semibold text-foreground">
              Congratulations! You've completed all learning pathways!
            </p>
            <p className="text-sm text-muted-foreground">
              You're now ready to build complex hydraulic models with confidence.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
