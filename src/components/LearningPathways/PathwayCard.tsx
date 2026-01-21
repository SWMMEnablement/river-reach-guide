import { motion } from "framer-motion";
import { ChevronRight, CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PathwayStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  completed?: boolean;
  sectionId?: string;
}

export interface PathwayData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: "primary" | "water" | "terrain" | "node";
  steps: PathwayStep[];
  estimatedTime: string;
}

interface PathwayCardProps {
  pathway: PathwayData;
  isExpanded: boolean;
  onToggle: () => void;
  onStepClick: (step: PathwayStep) => void;
  completedSteps: Set<string>;
}

const colorVariants = {
  primary: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    icon: "bg-primary text-primary-foreground",
    accent: "text-primary",
    progress: "bg-primary",
  },
  water: {
    bg: "bg-water-light",
    border: "border-water/30",
    icon: "bg-water text-white",
    accent: "text-water-dark",
    progress: "bg-water",
  },
  terrain: {
    bg: "bg-terrain-light",
    border: "border-terrain/30",
    icon: "bg-terrain text-white",
    accent: "text-terrain",
    progress: "bg-terrain",
  },
  node: {
    bg: "bg-node-light",
    border: "border-node/30",
    icon: "bg-node text-white",
    accent: "text-node",
    progress: "bg-node",
  },
};

export const PathwayCard = ({
  pathway,
  isExpanded,
  onToggle,
  onStepClick,
  completedSteps,
}: PathwayCardProps) => {
  const colors = colorVariants[pathway.color];
  const totalSteps = pathway.steps.length;
  const completedCount = pathway.steps.filter((s) => completedSteps.has(s.id)).length;
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  return (
    <motion.div
      layout
      className={cn(
        "rounded-2xl border-2 overflow-hidden transition-all shadow-sm hover:shadow-md",
        colors.bg,
        colors.border
      )}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-start gap-4 text-left hover:bg-black/5 transition-colors"
      >
        <div className={cn("p-3 rounded-xl flex-shrink-0", colors.icon)}>
          {pathway.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-lg text-foreground">{pathway.title}</h3>
            <ChevronRight
              className={cn(
                "w-5 h-5 text-muted-foreground transition-transform flex-shrink-0",
                isExpanded && "rotate-90"
              )}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {pathway.description}
          </p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {pathway.estimatedTime}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {completedCount}/{totalSteps} steps
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-black/10 rounded-full overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", colors.progress)}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </button>

      {/* Steps list */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="border-t border-black/10"
        >
          <div className="p-4 space-y-2">
            {pathway.steps.map((step, index) => {
              const isCompleted = completedSteps.has(step.id);
              return (
                <motion.button
                  key={step.id}
                  onClick={() => onStepClick(step)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all",
                    "hover:bg-black/5 group"
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className={cn("w-5 h-5", colors.accent)} />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "font-medium text-sm",
                          isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                        )}
                      >
                        {step.title}
                      </span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {step.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
