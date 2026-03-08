import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Circle, Clock, GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";
import { learningPathways } from "@/components/LearningPathways/pathwayData";

const STORAGE_KEY = "learning-progress";

const pathwayRouteMap: Record<string, string> = {
  "get-started": "get-started",
  "culverts": "master-culverts",
  "gvf": "master-gvf",
  "coupling": "master-2d",
  "solve-problem": "solve-problem",
};

// Map section IDs to routes for navigation
const sectionToRoute: Record<string, string> = {
  "diagram": "/#diagram",
  "editor": "/#editor",
  "steps": "/#steps",
  "quiz": "/#quiz",
  "troubleshooting": "/troubleshooting",
  "advanced-concepts": "/#advanced-concepts",
  "froude-calculator": "/calculators/froude",
  "gvf-calculator": "/calculators/gvf",
  "culvert-calculator": "/calculators/culvert",
  "2d-modeling": "/#2d-modeling",
};

const LearnPathwayPage = () => {
  const { pathwayId } = useParams<{ pathwayId: string }>();
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCompletedSteps(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(completedSteps)));
    } catch {}
  }, [completedSteps]);

  const mappedId = pathwayRouteMap[pathwayId || ""] || pathwayId;
  const pathway = learningPathways.find(p => p.id === mappedId);

  if (!pathway) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Pathway not found.</p>
        <Link to="/" className="text-primary underline mt-4 inline-block">Return home</Link>
      </div>
    );
  }

  const completedCount = pathway.steps.filter(s => completedSteps.has(s.id)).length;
  const progress = Math.round((completedCount / pathway.steps.length) * 100);

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  return (
    <section className="py-10 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{pathway.title}</h1>
              <p className="text-sm text-muted-foreground">{pathway.estimatedTime} • {pathway.steps.length} steps</p>
            </div>
          </div>
          <p className="text-muted-foreground mt-3 mb-8">{pathway.description}</p>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">{completedCount}/{pathway.steps.length} completed</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {pathway.steps.map((step, i) => {
              const isCompleted = completedSteps.has(step.id);
              const route = step.sectionId ? sectionToRoute[step.sectionId] : undefined;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                    isCompleted
                      ? "bg-primary/5 border-primary/30"
                      : "bg-card border-border hover:border-primary/40"
                  }`}
                >
                  <button onClick={() => toggleStep(step.id)} className="mt-0.5 flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-primary" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold ${isCompleted ? "text-primary" : "text-foreground"}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" /> {step.duration}
                      </span>
                      {route && (
                        <Link
                          to={route}
                          className="text-xs text-primary hover:underline"
                          onClick={() => toggleStep(step.id)}
                        >
                          Go to section →
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LearnPathwayPage;
