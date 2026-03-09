import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Circle, Waves, Layers, Droplets, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const calculators = [
  { label: "Rating Curve", href: "/calculators/rating-curve", icon: TrendingUp },
  { label: "Culvert", href: "/calculators/culvert", icon: Circle },
  { label: "Froude", href: "/calculators/froude", icon: Waves },
  { label: "GVF Profile", href: "/calculators/gvf", icon: TrendingUp },
  { label: "Weir & Orifice", href: "/calculators/weir", icon: Droplets },
  { label: "Compound", href: "/calculators/compound", icon: Layers },
  { label: "Hydraulic Jump", href: "/calculators/hydraulic-jump", icon: Zap },
];

export const CalculatorQuickLaunch = () => {
  const location = useLocation();
  const isOnCalculator = location.pathname.startsWith("/calculators/");

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
    >
      <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-card/95 backdrop-blur-md border border-border shadow-lg">
        {calculators.map((calc) => {
          const isActive = location.pathname === calc.href;
          return (
            <Tooltip key={calc.href}>
              <TooltipTrigger asChild>
                <Link
                  to={calc.href}
                  className={`p-2.5 rounded-full transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <calc.icon className="w-4 h-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {calc.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </motion.div>
  );
};
