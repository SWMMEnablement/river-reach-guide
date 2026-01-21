import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Play, 
  BookOpen,
  Map,
  PenTool,
  Calculator,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StoryStep {
  id: string;
  title: string;
  description: string;
  targetSection: string;
  icon: React.ReactNode;
  tip?: string;
}

const storySteps: StoryStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Academy',
    description: 'This guided tour will walk you through the key sections of the ICM River Reach Modeler. Each step builds on the previous, creating a complete learning journey.',
    targetSection: 'pathways',
    icon: <Sparkles className="w-5 h-5" />,
    tip: 'You can exit story mode at any time by clicking the X button.',
  },
  {
    id: 'diagram',
    title: 'Understanding the River Reach Model',
    description: 'Start by exploring the interactive diagram. Click on any element (nodes, reaches, cross-sections) to learn what each component does in a 1D model.',
    targetSection: 'diagram',
    icon: <Map className="w-5 h-5" />,
    tip: 'Try clicking on the "River Reach" element to see its key parameters.',
  },
  {
    id: 'visualizer',
    title: 'Channel Visualizer & Calculators',
    description: 'Now explore the Channel Visualizer. Adjust geometry parameters and watch real-time Manning\'s equation calculations. Try different cross-section shapes and see how they affect flow.',
    targetSection: 'editor',
    icon: <PenTool className="w-5 h-5" />,
    tip: 'Switch between Cross-Section, Long Profile, and Plan views to see different perspectives.',
  },
  {
    id: 'calculators',
    title: 'Hydraulic Calculators',
    description: 'Scroll down within the Channel Visualizer section to find specialized calculators: GVF profiles, Froude number analysis, culvert design, and weir/orifice flow. Each provides interpretive insights.',
    targetSection: 'editor',
    icon: <Calculator className="w-5 h-5" />,
    tip: 'Look for the "Interpretation & Next Steps" panel below each calculator\'s results.',
  },
  {
    id: 'steps',
    title: 'Step-by-Step Modeling Guide',
    description: 'Follow the detailed workflow for building a river reach model in ICM InfoWorks. Each step includes pro tips from experienced modelers.',
    targetSection: 'steps',
    icon: <BookOpen className="w-5 h-5" />,
    tip: 'Expand each step to see detailed instructions and common pitfalls.',
  },
  {
    id: 'quiz',
    title: 'Test Your Knowledge',
    description: 'Finally, take the quiz to reinforce what you\'ve learned. Questions cover concepts from all sections you\'ve explored.',
    targetSection: 'quiz',
    icon: <GraduationCap className="w-5 h-5" />,
    tip: 'Don\'t worry if you miss some—each answer includes an explanation!',
  },
];

interface StoryModeGuideProps {
  onClose: () => void;
  isVisible: boolean;
}

export const StoryModeGuide = ({ onClose, isVisible }: StoryModeGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const scrollToSection = useCallback((sectionId: string) => {
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (isVisible && !isMinimized) {
      scrollToSection(storySteps[currentStep].targetSection);
    }
  }, [currentStep, isVisible, isMinimized, scrollToSection]);

  const handleNext = () => {
    if (currentStep < storySteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setIsMinimized(false);
  };

  const step = storySteps[currentStep];
  const progress = ((currentStep + 1) / storySteps.length) * 100;

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay backdrop (subtle) */}
      <div className="fixed inset-0 bg-background/20 backdrop-blur-[1px] z-40 pointer-events-none" />

      {/* Story Mode Panel */}
      <AnimatePresence mode="wait">
        {!isMinimized ? (
          <motion.div
            key="panel"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[420px] z-50"
          >
            <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
              {/* Progress bar */}
              <div className="h-1 bg-secondary">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-border bg-secondary/30">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary text-primary-foreground">
                    <Play className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Story Mode</span>
                  <span className="text-xs text-muted-foreground">
                    {currentStep + 1} / {storySteps.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setIsMinimized(true)}
                  >
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onClose}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {step.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{step.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {step.tip && (
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 mt-3">
                        <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          {step.tip}
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Step indicators */}
              <div className="flex items-center justify-center gap-1.5 px-4 pb-2">
                {storySteps.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => handleStepClick(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentStep
                        ? 'w-6 bg-primary'
                        : i < currentStep
                        ? 'w-1.5 bg-primary/60'
                        : 'w-1.5 bg-muted-foreground/30'
                    }`}
                    aria-label={`Go to step ${i + 1}: ${s.title}`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between p-3 border-t border-border bg-secondary/20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="gap-1"
                >
                  {currentStep === storySteps.length - 1 ? 'Finish' : 'Next'}
                  {currentStep < storySteps.length - 1 && (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="minimized"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsMinimized(false)}
            className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            <Play className="w-4 h-4" />
            <span className="text-sm font-medium">
              Story Mode ({currentStep + 1}/{storySteps.length})
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};
