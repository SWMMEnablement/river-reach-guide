import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, RotateCcw, Brain, ChevronRight, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

interface CalculatorQuizProps {
  title: string;
  questions: QuizQuestion[];
  calculatorValues?: Record<string, number | string>;
}

export const CalculatorQuiz = ({ title, questions, calculatorValues }: CalculatorQuizProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [quizComplete, setQuizComplete] = useState(false);

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question?.correctIndex;
  const hasAnswered = answeredQuestions.has(currentQuestion);

  const handleSelectAnswer = (index: number) => {
    if (hasAnswered) return;
    
    setSelectedAnswer(index);
    setShowFeedback(true);
    setShowHint(false);
    setAnsweredQuestions(new Set([...answeredQuestions, currentQuestion]));
    
    if (index === question.correctIndex) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setShowHint(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowHint(false);
    setScore(0);
    setAnsweredQuestions(new Set());
    setQuizComplete(false);
  };

  const getOptionClass = (index: number) => {
    if (!hasAnswered) {
      return selectedAnswer === index
        ? "border-primary bg-primary/5"
        : "border-border hover:border-primary/50 hover:bg-secondary/50";
    }
    
    if (index === question.correctIndex) {
      return "border-green-500 bg-green-50 dark:bg-green-950/30";
    }
    
    if (selectedAnswer === index && index !== question.correctIndex) {
      return "border-red-400 bg-red-50 dark:bg-red-950/30";
    }
    
    return "border-border opacity-50";
  };

  const progressPercentage = ((answeredQuestions.size) / questions.length) * 100;

  // Inject calculator values into question text
  const processQuestionText = (text: string) => {
    if (!calculatorValues) return text;
    let processed = text;
    Object.entries(calculatorValues).forEach(([key, value]) => {
      const replacement = typeof value === 'number' ? value.toFixed(3) : String(value);
      processed = processed.replace(`{${key}}`, replacement);
    });
    return processed;
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2 mt-4 w-full border-dashed border-primary/30 hover:border-primary hover:bg-primary/5"
      >
        <Brain className="w-4 h-4" />
        Test Your Understanding
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 border border-primary/20 rounded-lg overflow-hidden"
    >
      <div className="bg-primary/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">{title}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="h-7 px-2 text-xs"
        >
          Close
        </Button>
      </div>

      <div className="p-4">
        {quizComplete ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-primary-foreground" />
            </div>
            
            <h4 className="text-lg font-bold mb-1">Quiz Complete!</h4>
            
            <div className="bg-secondary/50 rounded-lg p-3 mb-4 inline-block">
              <p className="text-2xl font-bold">
                {score} / {questions.length}
              </p>
              <p className="text-xs text-muted-foreground">
                {Math.round((score / questions.length) * 100)}% Correct
              </p>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {score === questions.length 
                ? "Perfect! You've mastered this concept." 
                : score >= questions.length * 0.7
                ? "Great job! Review the missed concepts."
                : "Keep practicing with the calculator above."}
            </p>
            
            <Button
              onClick={handleRestart}
              size="sm"
              className="gap-2"
            >
              <RotateCcw className="w-3 h-3" />
              Try Again
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-muted-foreground">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span className="text-xs font-medium text-primary">
                  Score: {score}/{answeredQuestions.size}
                </span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Question */}
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <p className="text-sm font-medium mb-3">
                {processQuestionText(question.question)}
              </p>

              {/* Hint button */}
              {question.hint && !hasAnswered && !showHint && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(true)}
                  className="gap-1.5 mb-3 h-7 text-xs text-muted-foreground"
                >
                  <Lightbulb className="w-3 h-3" />
                  Show Hint
                </Button>
              )}

              {/* Hint display */}
              <AnimatePresence>
                {showHint && !hasAnswered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5 mb-3"
                  >
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                      <Lightbulb className="w-3 h-3 inline mr-1" />
                      {question.hint}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Options */}
              <div className="space-y-2 mb-4">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={hasAnswered}
                    className={`w-full p-2.5 rounded-lg border text-left transition-all duration-200 flex items-center gap-2 text-sm ${getOptionClass(index)}`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                      hasAnswered && index === question.correctIndex
                        ? "bg-green-500 text-white"
                        : hasAnswered && selectedAnswer === index && index !== question.correctIndex
                        ? "bg-red-400 text-white"
                        : "bg-secondary text-secondary-foreground"
                    }`}>
                      {hasAnswered && index === question.correctIndex ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : hasAnswered && selectedAnswer === index && index !== question.correctIndex ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </span>
                    <span className="flex-1">{processQuestionText(option)}</span>
                  </button>
                ))}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`rounded-lg p-3 mb-3 ${
                      isCorrect
                        ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                        : "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`text-xs font-medium mb-0.5 ${isCorrect ? "text-green-800 dark:text-green-200" : "text-amber-800 dark:text-amber-200"}`}>
                          {isCorrect ? "Correct!" : "Not quite"}
                        </p>
                        <p className={`text-xs ${isCorrect ? "text-green-700 dark:text-green-300" : "text-amber-700 dark:text-amber-300"}`}>
                          {processQuestionText(question.explanation)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              {hasAnswered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-end"
                >
                  <Button
                    onClick={handleNext}
                    size="sm"
                    className="gap-1.5"
                  >
                    {currentQuestion < questions.length - 1 ? "Next" : "Results"}
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

// Quiz question sets for each calculator
export const gvfQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Given normal depth yn > critical depth yc, what type of channel slope is this?",
    options: ["Steep slope", "Mild slope", "Critical slope", "Adverse slope"],
    correctIndex: 1,
    explanation: "When yn > yc, the channel is classified as 'Mild'. On mild slopes, subcritical flow tends to be the natural regime.",
    hint: "Compare which depth is larger - normal or critical."
  },
  {
    id: 2,
    question: "For an M1 profile, where is the water surface relative to normal depth?",
    options: ["Below normal depth", "Above normal depth", "Equal to normal depth", "Below critical depth"],
    correctIndex: 1,
    explanation: "M1 (backwater) profiles occur when flow depth is above normal depth. This happens when there's an obstruction or raised water level downstream.",
    hint: "M1 is a 'backwater' curve - think about what causes backwater."
  },
  {
    id: 3,
    question: "If your boundary depth equals {boundaryDepth} m and normal depth is {normalDepth} m, what profile type would form?",
    options: ["M1 - Backwater", "M2 - Drawdown", "S1 - Backwater", "S2 - Drawdown"],
    correctIndex: 0,
    explanation: "When boundary depth > normal depth on a mild slope, an M1 backwater curve develops, with depth decreasing upstream toward normal depth.",
    hint: "Compare boundary depth to normal depth. Is it above or below?"
  },
  {
    id: 4,
    question: "What controls the water surface profile in subcritical flow?",
    options: ["Upstream boundary condition", "Downstream boundary condition", "Channel roughness only", "Bed slope only"],
    correctIndex: 1,
    explanation: "In subcritical flow (Fr < 1), disturbances propagate upstream. Therefore, the downstream boundary condition controls the profile, and calculations proceed upstream.",
    hint: "Think about which direction waves travel in subcritical flow."
  }
];

export const froudeQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "A flow has Froude number Fr = 0.6. What type of flow regime is this?",
    options: ["Supercritical flow", "Critical flow", "Subcritical flow", "Transitional flow"],
    correctIndex: 2,
    explanation: "Fr < 1 indicates subcritical flow. The flow is 'tranquil' with deeper, slower water where gravity forces dominate over inertial forces.",
    hint: "Fr < 1 or Fr > 1? That determines the regime."
  },
  {
    id: 2,
    question: "What happens when supercritical flow transitions to subcritical flow?",
    options: ["Gradual depth increase", "Hydraulic jump forms", "Flow reverses direction", "Velocity remains constant"],
    correctIndex: 1,
    explanation: "When supercritical flow must transition to subcritical, energy dissipation occurs through a hydraulic jump - a rapid, turbulent rise in water surface.",
    hint: "How does nature dissipate excess kinetic energy?"
  },
  {
    id: 3,
    question: "At critical flow (Fr = 1), which statement is true?",
    options: ["Specific energy is maximum", "Specific energy is minimum for given Q", "Velocity equals wave celerity", "Both B and C are correct"],
    correctIndex: 3,
    explanation: "At critical flow: (1) specific energy is minimum for a given discharge, and (2) flow velocity equals the wave celerity √(gD), meaning surface waves cannot propagate upstream.",
    hint: "Think about the energy curve and wave propagation."
  },
  {
    id: 4,
    question: "The upstream Froude number is {froudeUpstream}. Would a disturbance propagate upstream?",
    options: ["Yes, disturbances always propagate upstream", "Only if Fr < 1", "No, because Fr > 1", "Depends on channel slope"],
    correctIndex: 1,
    explanation: "Disturbances can only propagate upstream in subcritical flow (Fr < 1). In supercritical flow, the flow velocity exceeds wave speed, preventing upstream propagation.",
    hint: "Compare flow velocity to wave celerity."
  }
];

export const culvertQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "A culvert shows inlet control HW of 2.1m and outlet control HW of 1.8m. Which controls?",
    options: ["Outlet control", "Inlet control", "Both equally", "Cannot determine"],
    correctIndex: 1,
    explanation: "The higher headwater value controls the design. Inlet control (2.1m > 1.8m) means the culvert entrance limits capacity, not the barrel or outlet.",
    hint: "Which condition produces the higher headwater?"
  },
  {
    id: 2,
    question: "For inlet-controlled culverts, what primarily limits flow capacity?",
    options: ["Barrel friction", "Tailwater depth", "Entrance geometry", "Pipe material"],
    correctIndex: 2,
    explanation: "Under inlet control, the entrance geometry (edge condition, headwall presence) limits capacity. The barrel can carry more than the inlet allows through.",
    hint: "If the inlet controls, what physical feature is the bottleneck?"
  },
  {
    id: 3,
    question: "The calculated capacity ratio is {capacityRatio}. What does this indicate?",
    options: ["Culvert is undersized", "Culvert is adequately sized", "Need more headwater data", "Tailwater is too high"],
    correctIndex: 1,
    explanation: "Capacity ratio < 1.0 means the available headwater exceeds required headwater - the culvert is adequate. Ratio > 1.0 means the culvert cannot pass the design flow.",
    hint: "Is capacity ratio < 1 or > 1?"
  },
  {
    id: 4,
    question: "Which entrance type provides the lowest entrance loss coefficient?",
    options: ["Projecting pipe", "Mitered to slope", "Square edge with headwall", "Groove end with headwall"],
    correctIndex: 2,
    explanation: "Square edge with headwall (Ke ≈ 0.2) provides the most efficient entrance. Projecting and mitered entrances have higher losses due to flow separation.",
    hint: "A well-aligned, confined entrance reduces turbulence."
  }
];

export const weirOrificeQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Why do V-notch weirs have H^(5/2) in the discharge equation instead of H^(3/2)?",
    options: ["Higher accuracy requirement", "The width increases with depth", "Manufacturing precision", "Temperature compensation"],
    correctIndex: 1,
    explanation: "For V-notch weirs, the effective width increases linearly with head (W = 2H·tan(θ/2)). This extra H term multiplied by the H^(3/2) term gives H^(5/2).",
    hint: "Think about how the flow area changes as head increases."
  },
  {
    id: 2,
    question: "An orifice Cd = 0.61 accounts for which effects?",
    options: ["Friction only", "Vena contracta only", "Both velocity reduction and jet contraction", "Temperature variation"],
    correctIndex: 2,
    explanation: "Cd combines the contraction coefficient (Cc ≈ 0.64 for sharp edges) and velocity coefficient (Cv ≈ 0.98). Cd = Cc × Cv accounts for the jet contracting and real velocity.",
    hint: "Cd is a product of two effects at the orifice."
  },
  {
    id: 3,
    question: "What happens to weir discharge accuracy when the approach Froude number exceeds 0.5?",
    options: ["Accuracy improves", "No significant effect", "Standard formulas may underestimate Q", "Flow becomes unmeasurable"],
    correctIndex: 2,
    explanation: "High approach velocities (Fr > 0.5) mean significant approach velocity head. Standard weir formulas assume negligible approach velocity and may underestimate actual discharge.",
    hint: "Standard formulas assume 'still water' approach conditions."
  },
  {
    id: 4,
    question: "For a submerged orifice, which head value should be used?",
    options: ["Upstream head above orifice center", "Difference between upstream and downstream heads", "Downstream head only", "Average of upstream and downstream"],
    correctIndex: 1,
    explanation: "For submerged orifices, the driving head is the differential head (H = H_upstream - H_downstream), not the total head above the orifice.",
    hint: "What creates the pressure difference across the orifice?"
  }
];
