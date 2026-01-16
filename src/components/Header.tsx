import { motion } from "framer-motion";
import { Waves, BookOpen, ExternalLink, GraduationCap, PenTool } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-water flex items-center justify-center">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">ICM River Reach Modeler</h1>
              <p className="text-xs text-muted-foreground">Interactive Learning Tool</p>
            </div>
          </motion.div>

          <motion.nav
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-5"
          >
            <a
              href="#diagram"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Diagram
            </a>
            <a
              href="#editor"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <PenTool className="w-3.5 h-3.5" />
              Editor
            </a>
            <a
              href="#steps"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Steps
            </a>
            <a
              href="#quiz"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              Quiz
            </a>
            <a
              href="https://help.autodesk.com/view/IWICMS/2025/ENU/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>ICM Help</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </motion.nav>
        </div>
      </div>
    </header>
  );
};
