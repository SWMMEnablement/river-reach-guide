import { Play, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface StoryModeButtonProps {
  onClick: () => void;
}

export const StoryModeButton = ({ onClick }: StoryModeButtonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
      className="relative group"
    >
      {/* Animated glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-blue-500/30 to-cyan-500/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <Button
        onClick={onClick}
        variant="outline"
        className="relative gap-3 px-6 py-6 h-auto flex-col sm:flex-row bg-gradient-to-br from-primary/5 via-blue-500/5 to-cyan-500/5 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Story Mode</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">NEW</span>
            </div>
            <p className="text-xs text-muted-foreground font-normal">
              Learn through immersive scenarios
            </p>
          </div>
        </div>
        <Play className="w-4 h-4 text-primary sm:ml-2" />
      </Button>
    </motion.div>
  );
};
