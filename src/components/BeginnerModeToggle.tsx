import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GraduationCap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeginnerModeToggleProps {
  isBeginnerMode: boolean;
  onToggle: () => void;
}

export const BeginnerModeToggle = ({ isBeginnerMode, onToggle }: BeginnerModeToggleProps) => {
  return (
    <motion.div 
      className="flex items-center gap-3 px-4 py-2 rounded-lg bg-card border border-border shadow-sm"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          {isBeginnerMode ? (
            <motion.div
              key="beginner"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
          ) : (
            <motion.div
              key="advanced"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <GraduationCap className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
        <Label 
          htmlFor="beginner-mode" 
          className="text-sm font-medium cursor-pointer select-none"
        >
          {isBeginnerMode ? 'Beginner Mode' : 'Full Mode'}
        </Label>
      </div>
      <Switch
        id="beginner-mode"
        checked={isBeginnerMode}
        onCheckedChange={onToggle}
        aria-label="Toggle beginner mode"
      />
    </motion.div>
  );
};
