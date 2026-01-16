import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, RotateCcw, Trophy, ChevronRight } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: "What defines the starting point of a river reach where water enters the system?",
    options: [
      "Cross Section",
      "Upstream Node",
      "Downstream Node",
      "Floodplain"
    ],
    correctIndex: 1,
    explanation: "The Upstream Node is the boundary point where water enters the river reach. It defines inflow conditions such as flow hydrographs or water levels."
  },
  {
    id: 2,
    question: "What type of equations does ICM use to solve 1D river flow?",
    options: [
      "Navier-Stokes equations",
      "Bernoulli equations",
      "Saint-Venant equations",
      "Darcy-Weisbach equations"
    ],
    correctIndex: 2,
    explanation: "ICM uses the 1D Saint-Venant equations (also known as shallow water equations) to model unsteady flow in river reaches, accounting for both momentum and continuity."
  },
  {
    id: 3,
    question: "What does Manning's n coefficient represent in river modeling?",
    options: [
      "Channel slope",
      "Flow velocity",
      "Surface roughness/resistance",
      "Water depth"
    ],
    correctIndex: 2,
    explanation: "Manning's n is a roughness coefficient that represents the resistance to flow caused by the channel bed and banks. Higher values indicate greater resistance (e.g., vegetated channels)."
  },
  {
    id: 4,
    question: "Which cross-section marker separates the main channel from the floodplain?",
    options: [
      "Thalweg marker",
      "Invert marker",
      "Bank marker",
      "Centerline marker"
    ],
    correctIndex: 2,
    explanation: "Bank markers on cross-sections indicate the top of the main channel banks, separating the main channel from left and right floodplain areas, which often have different roughness values."
  },
  {
    id: 5,
    question: "For subcritical flow, which boundary condition controls the backwater profile?",
    options: [
      "Upstream boundary",
      "Downstream boundary",
      "Both equally",
      "Neither - it's determined by channel slope"
    ],
    correctIndex: 1,
    explanation: "In subcritical flow (Froude number < 1), the downstream boundary condition controls the water surface profile. Changes in downstream level propagate upstream as backwater effects."
  },
  {
    id: 6,
    question: "What is the purpose of the 'Map' feature when surveying a website for URLs?",
    options: [
      "To generate a sitemap quickly",
      "To define cross-section geometry",
      "To set roughness coefficients",
      "To calculate flow velocity"
    ],
    correctIndex: 0,
    explanation: "Wait, that's a trick question about web scraping! In river modeling context, mapping refers to creating a planimetric representation of the channel. Cross-sections define the geometry at specific locations."
  },
  {
    id: 7,
    question: "What happens if the simulation timestep is too large for the reach length?",
    options: [
      "Results become more accurate",
      "Simulation runs faster with no issues",
      "Numerical instability and oscillations",
      "Storage volume increases"
    ],
    correctIndex: 2,
    explanation: "Using a timestep that's too large violates the Courant condition, leading to numerical instability, oscillating water levels, and potentially incorrect results. Reduce the timestep or increase spatial resolution."
  },
  {
    id: 8,
    question: "Which component provides additional storage volume during flood events?",
    options: [
      "Cross sections",
      "River reach nodes",
      "Floodplains",
      "Manning's coefficients"
    ],
    correctIndex: 2,
    explanation: "Floodplains are the extended areas beyond the main channel banks that provide additional storage and conveyance during high flow events, significantly affecting flood peak attenuation."
  }
];

export const KnowledgeQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [quizComplete, setQuizComplete] = useState(false);

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correctIndex;
  const hasAnswered = answeredQuestions.has(currentQuestion);

  const handleSelectAnswer = (index: number) => {
    if (hasAnswered) return;
    
    setSelectedAnswer(index);
    setShowFeedback(true);
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
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
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
      return "border-green-500 bg-green-50 text-green-900";
    }
    
    if (selectedAnswer === index && index !== question.correctIndex) {
      return "border-red-400 bg-red-50 text-red-900";
    }
    
    return "border-border opacity-50";
  };

  const progressPercentage = ((answeredQuestions.size) / questions.length) * 100;

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    let message = "";
    let emoji = "";
    
    if (percentage === 100) {
      message = "Perfect score! You're a river modeling expert!";
      emoji = "🏆";
    } else if (percentage >= 75) {
      message = "Great job! You have strong knowledge of river modeling.";
      emoji = "🌟";
    } else if (percentage >= 50) {
      message = "Good effort! Review the concepts and try again.";
      emoji = "📚";
    } else {
      message = "Keep learning! The interactive diagram can help.";
      emoji = "💪";
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-xl p-8 border border-border shadow-lg text-center max-w-lg mx-auto"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-water flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        
        <h3 className="text-2xl font-bold text-foreground mb-2">Quiz Complete!</h3>
        <p className="text-4xl font-bold text-primary mb-2">{emoji}</p>
        
        <div className="bg-secondary/50 rounded-lg p-4 mb-6">
          <p className="text-3xl font-bold text-foreground">
            {score} / {questions.length}
          </p>
          <p className="text-sm text-muted-foreground">
            {percentage}% Correct
          </p>
        </div>
        
        <p className="text-muted-foreground mb-6">{message}</p>
        
        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium text-primary">
            Score: {score}/{answeredQuestions.size}
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-water"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question card */}
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-card rounded-xl p-6 border border-border shadow-lg"
      >
        <h3 className="text-lg font-semibold text-foreground mb-6">
          {question.question}
        </h3>

        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              disabled={hasAnswered}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 flex items-center gap-3 ${getOptionClass(index)}`}
              whileHover={!hasAnswered ? { scale: 1.01 } : {}}
              whileTap={!hasAnswered ? { scale: 0.99 } : {}}
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                hasAnswered && index === question.correctIndex
                  ? "bg-green-500 text-white"
                  : hasAnswered && selectedAnswer === index && index !== question.correctIndex
                  ? "bg-red-400 text-white"
                  : "bg-secondary text-secondary-foreground"
              }`}>
                {hasAnswered && index === question.correctIndex ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : hasAnswered && selectedAnswer === index && index !== question.correctIndex ? (
                  <XCircle className="w-5 h-5" />
                ) : (
                  String.fromCharCode(65 + index)
                )}
              </span>
              <span className="flex-1">{option}</span>
            </motion.button>
          ))}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`rounded-lg p-4 mb-6 ${
                isCorrect
                  ? "bg-green-50 border border-green-200"
                  : "bg-amber-50 border border-amber-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium mb-1 ${isCorrect ? "text-green-800" : "text-amber-800"}`}>
                    {isCorrect ? "Correct!" : "Not quite right"}
                  </p>
                  <p className={`text-sm ${isCorrect ? "text-green-700" : "text-amber-700"}`}>
                    {question.explanation}
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
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
