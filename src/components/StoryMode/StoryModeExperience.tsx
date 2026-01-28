import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  MapPin,
  Clock,
  Target,
  Award,
  MessageCircle,
  Lightbulb,
  CheckCircle,
  XCircle,
  Sparkles,
  CloudRain,
  Sun,
  Sunset,
  Moon,
  CloudLightning
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StoryScenario, StoryChapter, StoryChoice, storyScenarios, getScenarioById } from './storyScenarios';

interface StoryModeExperienceProps {
  isVisible: boolean;
  onClose: () => void;
  initialScenarioId?: string;
}

const timeOfDayConfig = {
  dawn: { bg: 'from-orange-200 via-pink-100 to-blue-200', icon: Sun, label: 'Dawn' },
  day: { bg: 'from-sky-200 via-blue-100 to-white', icon: Sun, label: 'Day' },
  dusk: { bg: 'from-orange-300 via-purple-200 to-indigo-300', icon: Sunset, label: 'Dusk' },
  night: { bg: 'from-indigo-900 via-purple-900 to-slate-900', icon: Moon, label: 'Night' },
  storm: { bg: 'from-slate-600 via-slate-500 to-slate-700', icon: CloudLightning, label: 'Storm' }
};

const speakerConfig = {
  mentor: { name: 'Dr. Sarah Chen', role: 'Senior Hydraulic Engineer', color: 'text-emerald-600 dark:text-emerald-400' },
  mayor: { name: 'Mayor Thompson', role: 'Riverside Town', color: 'text-amber-600 dark:text-amber-400' },
  engineer: { name: 'Tom Richards', role: 'Coastal Engineer', color: 'text-blue-600 dark:text-blue-400' },
  narrator: { name: 'Narrator', role: '', color: 'text-muted-foreground' },
  operator: { name: 'Control Room Operator', role: 'Infrastructure Management', color: 'text-cyan-600 dark:text-cyan-400' },
  resident: { name: 'Local Resident', role: 'Community Member', color: 'text-rose-600 dark:text-rose-400' }
};

export const StoryModeExperience = ({ isVisible, onClose, initialScenarioId }: StoryModeExperienceProps) => {
  const [phase, setPhase] = useState<'selection' | 'playing' | 'paused'>('selection');
  const [currentScenario, setCurrentScenario] = useState<StoryScenario | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<StoryChoice | null>(null);
  const [showConsequence, setShowConsequence] = useState(false);
  const [correctChoices, setCorrectChoices] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [narrativeRevealed, setNarrativeRevealed] = useState(false);

  useEffect(() => {
    if (initialScenarioId) {
      const scenario = getScenarioById(initialScenarioId);
      if (scenario) {
        setCurrentScenario(scenario);
        setPhase('playing');
      }
    }
  }, [initialScenarioId]);

  const currentChapter = currentScenario?.chapters[currentChapterIndex];
  const progress = currentScenario 
    ? ((currentChapterIndex + 1) / currentScenario.chapters.length) * 100 
    : 0;

  const scrollToSection = useCallback((sectionId: string) => {
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  }, []);

  useEffect(() => {
    if (phase === 'playing' && currentChapter?.targetSection && !isMinimized) {
      scrollToSection(currentChapter.targetSection);
    }
    setNarrativeRevealed(false);
    setSelectedChoice(null);
    setShowConsequence(false);
    
    // Animate narrative reveal
    const timer = setTimeout(() => setNarrativeRevealed(true), 100);
    return () => clearTimeout(timer);
  }, [currentChapterIndex, phase, isMinimized, currentChapter, scrollToSection]);

  const startScenario = (scenario: StoryScenario) => {
    setCurrentScenario(scenario);
    setCurrentChapterIndex(0);
    setCorrectChoices(0);
    setAchievements([]);
    setPhase('playing');
  };

  const handleChoiceSelect = (choice: StoryChoice) => {
    setSelectedChoice(choice);
    setShowConsequence(true);
    if (choice.isCorrect) {
      setCorrectChoices(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (!currentScenario) return;
    
    // Record achievement if present
    if (currentChapter?.achievement) {
      setAchievements(prev => [...prev, currentChapter.achievement!]);
    }

    if (currentChapterIndex < currentScenario.chapters.length - 1) {
      setCurrentChapterIndex(prev => prev + 1);
    } else {
      // Scenario complete
      setPhase('selection');
      setCurrentScenario(null);
    }
  };

  const handlePrevious = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(prev => prev - 1);
    }
  };

  const canProceed = !currentChapter?.choices || showConsequence;

  if (!isVisible) return null;

  // Scenario Selection Screen
  if (phase === 'selection') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-auto"
      >
        <div className="min-h-screen p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  Story Mode
                </h1>
                <p className="text-muted-foreground mt-1">
                  Learn hydraulic modeling through immersive scenarios
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Scenario Cards */}
            <div className="grid gap-6">
              {storyScenarios.map((scenario, index) => (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => startScenario(scenario)}
                >
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${timeOfDayConfig.storm.bg} opacity-10 group-hover:opacity-20 transition-opacity`} />
                  
                  <div className="relative p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            scenario.difficulty === 'beginner' ? 'bg-green-500/20 text-green-600' :
                            scenario.difficulty === 'intermediate' ? 'bg-amber-500/20 text-amber-600' :
                            'bg-red-500/20 text-red-600'
                          }`}>
                            {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {scenario.estimatedTime}
                          </span>
                        </div>
                        
                        <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {scenario.title}
                        </h2>
                        <p className="text-sm text-primary font-medium mb-2">{scenario.subtitle}</p>
                        <p className="text-sm text-muted-foreground mb-4">{scenario.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {scenario.learningOutcomes.slice(0, 3).map((outcome, i) => (
                            <span key={i} className="text-xs bg-secondary/50 text-muted-foreground px-2 py-1 rounded-full">
                              {outcome}
                            </span>
                          ))}
                          {scenario.learningOutcomes.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{scenario.learningOutcomes.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end">
                        <Button className="gap-2 group-hover:bg-primary group-hover:text-primary-foreground">
                          <Play className="w-4 h-4" />
                          Start Journey
                        </Button>
                      </div>
                    </div>
                    
                    {/* Chapter count */}
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{scenario.chapters.length} chapters</span>
                        <span>•</span>
                        <span>Interactive decisions</span>
                        <span>•</span>
                        <span>Hands-on practice</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Coming Soon Placeholder */}
            <div className="mt-6 p-6 rounded-2xl border border-dashed border-border bg-muted/30 text-center">
              <Sparkles className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">More scenarios coming soon</p>
              <p className="text-xs text-muted-foreground mt-1">Urban Drainage, Dam Safety Analysis, Climate Adaptation...</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Minimized State
  if (isMinimized) {
    return (
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground rounded-2xl shadow-lg hover:shadow-xl transition-all"
      >
        <div className="relative">
          <Play className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium">Chapter {currentChapterIndex + 1}</p>
          <p className="text-xs opacity-80">{currentChapter?.title}</p>
        </div>
      </motion.button>
    );
  }

  // Active Story Experience
  const TimeIcon = currentChapter ? timeOfDayConfig[currentChapter.timeOfDay].icon : Sun;

  return (
    <>
      {/* Ambient overlay */}
      <div className="fixed inset-0 bg-background/40 backdrop-blur-[2px] z-40 pointer-events-none" />

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:bottom-4 md:left-4 md:right-auto md:w-[480px]"
      >
        <div className="bg-card border border-border rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden">
          {/* Scene Header */}
          <div className={`relative h-20 bg-gradient-to-r ${currentChapter ? timeOfDayConfig[currentChapter.timeOfDay].bg : 'from-sky-200 to-blue-200'} dark:opacity-80`}>
            {/* Progress bar */}
            <Progress value={progress} className="absolute top-0 left-0 right-0 h-1 rounded-none bg-black/10" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-foreground/70 mb-1">
                  <MapPin className="w-3 h-3" />
                  <span>{currentChapter?.location}</span>
                  <span className="opacity-50">•</span>
                  <TimeIcon className="w-3 h-3" />
                  <span>{currentChapter ? timeOfDayConfig[currentChapter.timeOfDay].label : ''}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {currentChapter?.title}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(true)}>
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Chapter Content */}
          <div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto">
            {/* Narrative Text */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`narrative-${currentChapterIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: narrativeRevealed ? 1 : 0 }}
                className="text-sm text-foreground leading-relaxed"
              >
                {currentChapter?.narrative}
              </motion.p>
            </AnimatePresence>

            {/* Character Dialogue */}
            {currentChapter?.characterDialogue && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-secondary/50 rounded-xl p-4 border border-border"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold text-sm ${speakerConfig[currentChapter.characterDialogue.speaker].color}`}>
                        {speakerConfig[currentChapter.characterDialogue.speaker].name}
                      </span>
                      {speakerConfig[currentChapter.characterDialogue.speaker].role && (
                        <span className="text-xs text-muted-foreground">
                          {speakerConfig[currentChapter.characterDialogue.speaker].role}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                      "{currentChapter.characterDialogue.text}"
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Task/Interaction Hint */}
            {currentChapter?.interactionHint && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20"
              >
                <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-primary">Your Task</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {currentChapter.interactionHint}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Choices */}
            {currentChapter?.choices && !showConsequence && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  What's your answer?
                </p>
                {currentChapter.choices.map((choice, index) => (
                  <motion.button
                    key={choice.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    onClick={() => handleChoiceSelect(choice)}
                    className="w-full text-left p-3 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <span className="text-sm">{choice.text}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Consequence Feedback */}
            {showConsequence && selectedChoice && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-xl border ${
                  selectedChoice.isCorrect 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {selectedChoice.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${selectedChoice.isCorrect ? 'text-green-600' : 'text-amber-600'}`}>
                      {selectedChoice.isCorrect ? 'Correct!' : 'Not quite...'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedChoice.consequence}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Revealed Concept */}
            {currentChapter?.revealConcept && (showConsequence || !currentChapter.choices) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
              >
                <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Key Concept</p>
                  <p className="text-sm text-foreground font-mono mt-1">
                    {currentChapter.revealConcept}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Achievement */}
            {currentChapter?.achievement && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
              >
                <Award className="w-8 h-8 text-amber-500" />
                <div>
                  <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Achievement Unlocked</p>
                  <p className="text-sm font-semibold text-foreground">{currentChapter.achievement}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between p-4 border-t border-border bg-secondary/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={currentChapterIndex === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-1.5">
              {currentScenario?.chapters.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentChapterIndex
                      ? 'w-6 bg-primary'
                      : i < currentChapterIndex
                      ? 'w-1.5 bg-primary/60'
                      : 'w-1.5 bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>

            <Button
              size="sm"
              onClick={handleNext}
              disabled={!canProceed}
              className="gap-1"
            >
              {currentChapterIndex === (currentScenario?.chapters.length ?? 1) - 1 ? 'Complete' : 'Continue'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
};
