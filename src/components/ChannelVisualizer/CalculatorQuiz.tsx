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
  },
  {
    id: 5,
    question: "In a compound channel with main channel and floodplains, how should conveyance be calculated?",
    options: ["Use a single Manning's n for entire section", "Sum individual zone conveyances (K = K₁ + K₂ + K₃)", "Use the main channel only", "Average the hydraulic radii"],
    correctIndex: 1,
    explanation: "For compound channels, divide into subsections with different roughness. Calculate conveyance K = (1/n)AR^(2/3) for each, then sum: Q = (K₁ + K₂ + K₃)√S₀.",
    hint: "Each zone has different roughness and hydraulic radius."
  },
  {
    id: 6,
    question: "When does a Composite Manning's n approach fail for compound channels?",
    options: ["When flow is subcritical", "When velocity differences between zones exceed 50%", "When the channel is straight", "When roughness is uniform"],
    correctIndex: 1,
    explanation: "Large velocity differences between main channel and floodplain create momentum exchange and turbulence at interfaces, which single-n approaches cannot capture.",
    hint: "Think about shear forces at the interface between fast and slow zones."
  },
  {
    id: 7,
    question: "What is the Lateral Distribution Method (LDM) used for in GVF analysis?",
    options: ["Calculating bridge pier losses", "Distributing flow across compound channel zones", "Determining sediment transport", "Computing energy losses at contractions"],
    correctIndex: 1,
    explanation: "LDM distributes total discharge across main channel and floodplain zones based on conveyance ratios, accounting for different velocities and depths in each zone.",
    hint: "It addresses the question of 'how much flow goes where?'"
  },
  {
    id: 8,
    question: "In a steep channel transitioning to mild, which profile develops downstream of the break?",
    options: ["M3 transitioning through hydraulic jump to M1", "S2 continuing downstream", "M2 drawdown curve", "Critical depth maintained"],
    correctIndex: 0,
    explanation: "Supercritical flow from steep slope enters mild channel as M3 (below yc). It must transition to subcritical via hydraulic jump, then develops toward M1 or normal depth.",
    hint: "How does supercritical flow become subcritical?"
  },
  {
    id: 9,
    question: "What causes the 'kinematic wave' simplification to fail in GVF calculations?",
    options: ["High channel roughness", "Significant backwater effects", "Steady flow conditions", "Uniform channel geometry"],
    correctIndex: 1,
    explanation: "Kinematic wave assumes Sf ≈ S₀ (friction slope equals bed slope). Backwater creates depth variations where Sf ≠ S₀, requiring full dynamic wave or diffusion wave equations.",
    hint: "Kinematic wave ignores pressure gradient terms."
  },
  {
    id: 10,
    question: "Why does the step-backwater method start from a known boundary condition?",
    options: ["Computational convenience", "The boundary controls the entire profile in subcritical flow", "To avoid negative depths", "Manning's equation requires it"],
    correctIndex: 1,
    explanation: "In subcritical flow, information propagates upstream from the control point. Starting from the known downstream condition ensures the computed profile satisfies the governing equations.",
    hint: "Consider the direction of information propagation in subcritical flow."
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
  },
  {
    id: 5,
    question: "Using the Bélanger equation, if y₁ = 0.5m and Fr₁ = 3.0, what is the sequent depth y₂?",
    options: ["y₂ ≈ 1.9 m", "y₂ ≈ 3.7 m", "y₂ ≈ 5.5 m", "y₂ ≈ 0.8 m"],
    correctIndex: 1,
    explanation: "Using y₂/y₁ = ½(√(1 + 8Fr₁²) - 1) = ½(√(1 + 72) - 1) = ½(8.54 - 1) = 3.77. So y₂ = 0.5 × 3.77 ≈ 1.9m... wait, let me recalculate: ½(√73 - 1) ≈ 3.77, y₂ ≈ 1.89m rounds to ~1.9m.",
    hint: "Apply: y₂/y₁ = ½(√(1 + 8Fr₁²) - 1)"
  },
  {
    id: 6,
    question: "The energy loss in a hydraulic jump is given by ΔE = (y₂ - y₁)³/(4y₁y₂). What percentage of upstream energy is typically lost in a jump with Fr₁ = 4?",
    options: ["About 10%", "About 30%", "About 50%", "About 70%"],
    correctIndex: 2,
    explanation: "For Fr₁ = 4, the sequent depth ratio y₂/y₁ ≈ 5.1. Energy loss ΔE/E₁ increases significantly with Fr₁. At Fr₁ = 4, approximately 50% of the upstream specific energy is dissipated.",
    hint: "Higher Froude numbers mean more violent jumps and greater energy loss."
  },
  {
    id: 7,
    question: "A 'weak' hydraulic jump occurs at which Froude number range?",
    options: ["Fr₁ = 1.0 to 1.7", "Fr₁ = 1.7 to 2.5", "Fr₁ = 2.5 to 4.5", "Fr₁ > 4.5"],
    correctIndex: 0,
    explanation: "Weak jumps (Fr₁ = 1.0-1.7) have small surface rollers with minimal energy dissipation (~5%). Oscillating jumps (1.7-2.5), steady jumps (2.5-4.5), and strong jumps (>4.5) follow.",
    hint: "Jump classification relates to Fr₁ magnitude and turbulence intensity."
  },
  {
    id: 8,
    question: "In a trapezoidal channel, why is hydraulic depth D = A/T used instead of actual depth for Froude number?",
    options: ["Computational simplicity", "It represents the depth that gives equivalent wave celerity", "Historical convention", "Manning's equation requires it"],
    correctIndex: 1,
    explanation: "Hydraulic depth D = A/T gives the equivalent rectangular depth where the wave celerity c = √(gD) matches the actual channel. This accounts for non-rectangular geometry effects on wave propagation.",
    hint: "Wave celerity depends on the average depth, not maximum depth."
  },
  {
    id: 9,
    question: "What is the 'momentum function' M in hydraulic jump analysis?",
    options: ["M = Q × V", "M = ρQV + pressure force = Q²/(gA) + ȳA", "M = ½ρV²", "M = γyA"],
    correctIndex: 1,
    explanation: "Momentum function M = Q²/(gA) + ȳA combines momentum flux (Q²/gA) and hydrostatic pressure force (ȳA). At the jump, M₁ = M₂, conserving momentum while energy is lost.",
    hint: "It combines momentum and pressure terms that must balance across the jump."
  },
  {
    id: 10,
    question: "A hydraulic jump occurs at the calculated energy loss of {energyLoss} m. How would you classify this jump's efficiency for energy dissipation?",
    options: ["Inefficient - consider other structures", "Moderate - acceptable for most designs", "Highly efficient - optimal energy dissipator", "Cannot determine without downstream conditions"],
    correctIndex: 1,
    explanation: "Hydraulic jumps are natural energy dissipators. The efficiency depends on Fr₁ and the specific application. Most jumps with measurable ΔE provide acceptable dissipation.",
    hint: "Context matters - what is the jump being used for?"
  },
  {
    id: 11,
    question: "In a compound channel, how should the Froude number be calculated?",
    options: ["Use main channel depth only", "Use composite velocity V = Q/A_total and composite D = A_total/T_total", "Calculate Fr for each subsection separately", "Use the maximum depth in any zone"],
    correctIndex: 1,
    explanation: "For compound channels, use the composite approach: Fr = V/√(gD) where V = Q/A_total and D = A_total/T_total. This represents the overall flow state, though local Fr may vary.",
    hint: "The composite Froude represents the section's overall hydraulic behavior."
  },
  {
    id: 12,
    question: "Why is critical flow unstable and difficult to maintain in practice?",
    options: ["It requires precise slope control", "Any perturbation causes the flow to move toward subcritical or supercritical", "The water surface oscillates rapidly", "Both B and C are correct"],
    correctIndex: 3,
    explanation: "At Fr = 1, the specific energy is at minimum. Any disturbance causes flow to shift to a more stable subcritical or supercritical state, creating surface undulations.",
    hint: "Think about stability at the minimum of the E-y curve."
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
  },
  {
    id: 5,
    question: "For a multi-barrel culvert with 3 identical barrels, how is total capacity calculated?",
    options: ["Q_total = 3 × Q_single", "Q_total = √3 × Q_single", "Q_total < 3 × Q_single due to interference", "Q_total > 3 × Q_single due to reduced velocity"],
    correctIndex: 2,
    explanation: "Multi-barrel culverts have slightly reduced capacity per barrel due to flow interference between barrels, increased approach velocity, and non-uniform flow distribution.",
    hint: "Adjacent barrels interact with each other."
  },
  {
    id: 6,
    question: "What is the 'Performance Curve' in culvert analysis?",
    options: ["Plot of headwater vs discharge for all control conditions", "Graph of velocity vs. culvert slope", "Tailwater rating curve", "Manning's roughness vs. flow depth"],
    correctIndex: 0,
    explanation: "A performance curve plots HW vs Q showing both inlet and outlet control curves. The controlling condition at any Q is the curve with higher HW requirement.",
    hint: "It shows how the culvert behaves across the full range of flows."
  },
  {
    id: 7,
    question: "When does 'inlet depression' or 'FALL' improve culvert capacity?",
    options: ["When the culvert is on a steep slope", "When inlet control governs - depression increases effective head", "When outlet control governs", "When tailwater is high"],
    correctIndex: 1,
    explanation: "Inlet depression (lowering the inlet invert below the stream bed) increases the effective headwater depth, improving capacity when inlet control limits the design.",
    hint: "Think about how to increase driving head at the inlet."
  },
  {
    id: 8,
    question: "What is the HY-8 'Type 5' flow condition?",
    options: ["Full barrel flow with inlet control", "Outlet control with high tailwater drowning the outlet", "Inlet submerged, outlet unsubmerged, full barrel flow", "Free surface flow throughout"],
    correctIndex: 2,
    explanation: "Type 5 is outlet control with inlet submerged, full barrel flow, but outlet not submerged. The barrel acts like a pipe with free discharge at the outlet.",
    hint: "Consider the submergence conditions at both ends."
  },
  {
    id: 9,
    question: "For a long culvert (L/D > 25), which control type typically governs?",
    options: ["Inlet control due to entrance losses", "Outlet control due to accumulated friction losses", "Critical flow at the outlet", "Depends only on tailwater"],
    correctIndex: 1,
    explanation: "Long culverts accumulate significant friction losses through the barrel. This typically causes outlet control to govern, as inlet capacity exceeds barrel capacity.",
    hint: "Friction loss increases with length."
  },
  {
    id: 10,
    question: "Why might you add a second barrel rather than upsizing a single barrel?",
    options: ["Lower cost always", "Maintain low-flow depth for fish passage", "Reduce approach velocity", "Both B and C are benefits"],
    correctIndex: 3,
    explanation: "Multiple smaller barrels maintain adequate depth at low flows (important for aquatic organism passage) and reduce approach velocities compared to a single large barrel.",
    hint: "Consider conditions during both low flow and high flow."
  },
  {
    id: 11,
    question: "What happens to culvert capacity when tailwater rises above the outlet crown?",
    options: ["Capacity increases due to reduced exit loss", "Capacity decreases due to reduced driving head", "No change - inlet still controls", "Flow reverses direction"],
    correctIndex: 1,
    explanation: "High tailwater reduces the effective driving head (HW - TW), decreasing outlet control capacity. If tailwater exceeds headwater, backflow can occur.",
    hint: "The driving head is the difference between upstream and downstream levels."
  },
  {
    id: 12,
    question: "In culvert hydraulics, what is the 'critical slope' Sc?",
    options: ["Slope where normal depth equals critical depth", "Minimum slope for self-cleaning", "Maximum slope before erosion", "Slope for minimum headwater"],
    correctIndex: 0,
    explanation: "Critical slope Sc is where uniform flow occurs at critical depth (yn = yc, Fr = 1). Slopes > Sc produce supercritical uniform flow; slopes < Sc produce subcritical.",
    hint: "It's the transition point between steep and mild behavior."
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
  },
  {
    id: 5,
    question: "What is the 'modular limit' for a weir?",
    options: ["Maximum discharge capacity", "Submergence ratio beyond which free-flow formula fails", "Minimum measurable head", "Temperature operating range"],
    correctIndex: 1,
    explanation: "The modular limit is the submergence ratio (H_downstream/H_upstream) above which tailwater affects the weir discharge and free-flow formulas no longer apply (typically 0.7-0.85).",
    hint: "At what point does downstream water 'drown' the weir?"
  },
  {
    id: 6,
    question: "For a compound weir (rectangular + V-notch), at low flows which section controls?",
    options: ["Rectangular section", "V-notch section", "Both equally", "Depends on approach velocity"],
    correctIndex: 1,
    explanation: "At low flows, water only passes through the V-notch. The rectangular (main) crest only activates when head exceeds the V-notch height, providing low-flow accuracy with high-flow capacity.",
    hint: "Which part of the weir is lower?"
  },
  {
    id: 7,
    question: "Why is the Villemonte equation used for submerged weir flow?",
    options: ["Higher accuracy than Kindsvater-Carter", "It corrects free-flow Q for submergence effects", "Only method for broad-crested weirs", "Required by regulatory agencies"],
    correctIndex: 1,
    explanation: "Villemonte provides a submergence correction factor: Qs = Qf × [1 - (H₂/H₁)^n]^0.385. This modifies the free-flow discharge based on the degree of submergence.",
    hint: "It relates submerged flow to free flow conditions."
  },
  {
    id: 8,
    question: "What causes 'nappe oscillation' at a sharp-crested weir?",
    options: ["Air trapped under the nappe", "Variable discharge", "Temperature changes", "Sediment accumulation"],
    correctIndex: 0,
    explanation: "Without adequate aeration, air pockets under the nappe are unstable, causing the nappe to oscillate between clinging and springing. Ventilation slots prevent this.",
    hint: "What happens to the air space under the falling water?"
  },
  {
    id: 9,
    question: "An ogee spillway is designed for head Hd = 2m. What happens at H = 3m (150% design head)?",
    options: ["Cd decreases, reducing efficiency", "Cd increases to ~2.26, flow separates from crest", "Spillway fails structurally", "No significant change"],
    correctIndex: 1,
    explanation: "At heads above design (H > Hd), the nappe separates from the curved crest surface, creating negative pressure. Cd increases slightly but cavitation risk also increases.",
    hint: "The ogee shape was designed for a specific head."
  },
  {
    id: 10,
    question: "For sluice gate free flow, what determines if the downstream is 'free' or 'submerged'?",
    options: ["Gate opening ratio only", "Tailwater depth relative to vena contracta depth", "Upstream Froude number", "Gate material"],
    correctIndex: 1,
    explanation: "Free flow occurs when tailwater is below the vena contracta depth (y₂ < Cc × a). When tailwater exceeds this, the gate becomes submerged and discharge decreases.",
    hint: "Compare tailwater to the contracted jet depth."
  },
  {
    id: 11,
    question: "What is the 'velocity of approach' correction for weirs?",
    options: ["Reduce measured head by V²/2g", "Add V²/2g to measured head to get total head", "Multiply discharge by velocity factor", "Subtract friction losses"],
    correctIndex: 1,
    explanation: "The true head driving flow is H + V₀²/(2g) where V₀ is approach velocity. For significant approach velocities, this correction increases calculated discharge.",
    hint: "Consider the energy equation - what head is actually available?"
  },
  {
    id: 12,
    question: "Why are Cipoletti (trapezoidal) weirs designed with 1:4 side slopes?",
    options: ["Structural stability", "To compensate for end contractions, giving Q ∝ L × H^1.5", "Easier construction", "Historical convention"],
    correctIndex: 1,
    explanation: "The 1:4 slope adds triangular area that compensates for reduced flow at the ends (contractions). This allows using the simple rectangular formula without contraction corrections.",
    hint: "The sloped sides add area to offset something else."
  }
];
