import { Play } from 'lucide-react';
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
    >
      <Button
        onClick={onClick}
        variant="outline"
        className="gap-2 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/30 hover:border-primary hover:bg-primary/20 transition-all"
      >
        <Play className="w-4 h-4" />
        <span>Start Story Mode</span>
      </Button>
    </motion.div>
  );
};
