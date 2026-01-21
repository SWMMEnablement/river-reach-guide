import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tutorialSteps, TutorialStep } from "./tutorialSteps";
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, RotateCcw, Lightbulb, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiagramElement {
  id: string;
  name: string;
  description: string;
  details: string[];
}

const elements: DiagramElement[] = [
  {
    id: "upstream-node",
    name: "Upstream Node",
    description: "The starting point of a river reach where water enters the system.",
    details: [
      "Defines inflow boundary conditions",
      "Can connect to other reaches or external sources",
      "Requires water level or flow hydrograph input",
    ],
  },
  {
    id: "downstream-node",
    name: "Downstream Node",
    description: "The ending point where water exits the reach.",
    details: [
      "Defines outflow boundary conditions",
      "Can specify normal depth or tidal conditions",
      "Links to downstream reaches or outfalls",
    ],
  },
  {
    id: "river-reach",
    name: "River Reach",
    description: "The channel link connecting nodes, representing the river section.",
    details: [
      "Contains multiple cross-sections",
      "Uses 1D Saint-Venant equations",
      "Defines conveyance and storage properties",
    ],
  },
  {
    id: "cross-section",
    name: "Cross Section",
    description: "Defines the geometry of the river at a specific location.",
    details: [
      "Survey data points (chainage, elevation)",
      "Bank markers for floodplain separation",
      "Manning's roughness coefficients",
    ],
  },
  {
    id: "floodplain",
    name: "Floodplain",
    description: "Extended storage areas beyond the main channel banks.",
    details: [
      "Separate roughness values from main channel",
      "Provides additional storage volume",
      "Can be modeled as extended cross-sections or 2D zones",
    ],
  },
  {
    id: "water-surface",
    name: "Water Surface",
    description: "The calculated water level along the reach during simulation.",
    details: [
      "Varies with flow conditions",
      "Computed using energy/momentum equations",
      "Critical for flood extent mapping",
    ],
  },
];

interface GuidedRiverDiagramProps {
  onComplete?: () => void;
}

export const GuidedRiverDiagram = ({ onComplete }: GuidedRiverDiagramProps) => {
  const [isTutorialMode, setIsTutorialMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedElement, setSelectedElement] = useState<DiagramElement | null>(null);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  const currentTutorialStep = tutorialSteps.find(s => s.id === currentStep);
  const totalSteps = tutorialSteps.length;
  const progress = (completedSteps.length / totalSteps) * 100;

  const handleElementClick = (id: string) => {
    const element = elements.find((el) => el.id === id);
    setSelectedElement(element || null);

    if (isTutorialMode && currentTutorialStep?.elementId === id) {
      // Correct element clicked in tutorial mode
      if (!currentTutorialStep.validationQuestion) {
        // No question, auto-complete step
        handleStepComplete();
      }
    }
  };

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    setShowFeedback(true);

    if (currentTutorialStep?.validationQuestion?.correctIndex === index) {
      // Correct answer - wait then proceed
      setTimeout(() => {
        handleStepComplete();
      }, 2000);
    }
  };

  const handleStepComplete = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    setSelectedAnswer(null);
    setShowFeedback(false);

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tutorial complete
      onComplete?.();
    }
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const resetTutorial = () => {
    setCurrentStep(1);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setCompletedSteps([]);
    setSelectedElement(null);
  };

  const startTutorial = () => {
    resetTutorial();
    setIsTutorialMode(true);
  };

  const exitTutorial = () => {
    setIsTutorialMode(false);
    setSelectedElement(null);
  };

  const isElementHighlighted = (id: string) => {
    if (!isTutorialMode) return false;
    return currentTutorialStep?.elementId === id;
  };

  const isCorrectAnswer = currentTutorialStep?.validationQuestion?.correctIndex === selectedAnswer;

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Tutorial Mode Toggle */}
      {!isTutorialMode && (
        <div className="mb-4 flex justify-center">
          <Button onClick={startTutorial} className="gap-2">
            <GraduationCap className="w-4 h-4" />
            Start Guided Tutorial
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SVG Diagram */}
        <div className={`lg:col-span-2 bg-card rounded-xl p-6 shadow-lg border transition-all ${
          isTutorialMode ? 'border-primary/50 ring-2 ring-primary/20' : 'border-border'
        }`}>
          {isTutorialMode && (
            <div className="mb-4">
              {/* Progress bar */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-xs font-medium text-primary">{Math.round(progress)}% Complete</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          <h3 className="text-lg font-semibold text-foreground mb-2">
            {isTutorialMode ? currentTutorialStep?.title : 'Interactive River Reach Model'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isTutorialMode
              ? currentTutorialStep?.instruction
              : 'Click on any element to learn more about its role in the model'}
          </p>

          <svg
            viewBox="0 0 800 400"
            className="w-full h-auto"
            style={{ minHeight: "300px" }}
          >
            {/* Background gradient */}
            <defs>
              <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(195, 90%, 45%)" stopOpacity="0.6" />
                <stop offset="50%" stopColor="hsl(210, 85%, 50%)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="hsl(195, 90%, 45%)" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="terrainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(35, 45%, 55%)" />
                <stop offset="100%" stopColor="hsl(35, 35%, 40%)" />
              </linearGradient>
              <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(200, 60%, 94%)" />
                <stop offset="100%" stopColor="hsl(210, 25%, 97%)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="highlight">
                <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Sky background */}
            <rect x="0" y="0" width="800" height="400" fill="url(#skyGradient)" />

            {/* Left bank / floodplain */}
            <motion.path
              d="M0 280 Q100 260 150 240 L150 400 L0 400 Z"
              fill="url(#terrainGradient)"
              className="cursor-pointer"
              onClick={() => handleElementClick("floodplain")}
              onMouseEnter={() => setHoveredElement("floodplain")}
              onMouseLeave={() => setHoveredElement(null)}
              animate={{
                opacity: hoveredElement === "floodplain" || isElementHighlighted("floodplain") ? 1 : 0.9,
                filter: isElementHighlighted("floodplain") ? "url(#highlight)" : "none",
              }}
              style={{ transformOrigin: "75px 320px" }}
            />

            {/* Right bank / floodplain */}
            <motion.path
              d="M650 240 Q700 260 800 280 L800 400 L650 400 Z"
              fill="url(#terrainGradient)"
              className="cursor-pointer"
              onClick={() => handleElementClick("floodplain")}
              onMouseEnter={() => setHoveredElement("floodplain")}
              onMouseLeave={() => setHoveredElement(null)}
              animate={{
                opacity: hoveredElement === "floodplain" || isElementHighlighted("floodplain") ? 1 : 0.9,
                filter: isElementHighlighted("floodplain") ? "url(#highlight)" : "none",
              }}
              style={{ transformOrigin: "725px 320px" }}
            />

            {/* Channel bottom */}
            <path
              d="M150 320 Q400 350 650 320 L650 400 L150 400 Z"
              fill="hsl(35, 35%, 35%)"
            />

            {/* Main channel - River Reach */}
            <motion.path
              d="M150 240 Q200 250 400 260 Q600 250 650 240 L650 320 Q400 350 150 320 Z"
              fill="url(#waterGradient)"
              className="cursor-pointer"
              onClick={() => handleElementClick("river-reach")}
              onMouseEnter={() => setHoveredElement("river-reach")}
              onMouseLeave={() => setHoveredElement(null)}
              animate={{
                filter: hoveredElement === "river-reach" || isElementHighlighted("river-reach")
                  ? isElementHighlighted("river-reach") ? "url(#highlight)" : "url(#glow)"
                  : "none",
              }}
            />

            {/* Water surface line */}
            <motion.path
              d="M150 240 Q200 235 400 230 Q600 235 650 240"
              fill="none"
              stroke="hsl(195, 90%, 60%)"
              strokeWidth={isElementHighlighted("water-surface") ? 5 : 3}
              strokeDasharray="10 5"
              className="cursor-pointer water-flow"
              onClick={() => handleElementClick("water-surface")}
              onMouseEnter={() => setHoveredElement("water-surface")}
              onMouseLeave={() => setHoveredElement(null)}
              animate={{
                filter: isElementHighlighted("water-surface") ? "url(#highlight)" : "none",
              }}
            />

            {/* Flow arrows */}
            <g className="water-flow">
              <path
                d="M300 250 L340 250 L335 245 M340 250 L335 255"
                fill="none"
                stroke="hsl(0, 0%, 100%)"
                strokeWidth="2"
                opacity="0.8"
              />
              <path
                d="M450 255 L490 255 L485 250 M490 255 L485 260"
                fill="none"
                stroke="hsl(0, 0%, 100%)"
                strokeWidth="2"
                opacity="0.8"
              />
            </g>

            {/* Cross section lines */}
            {[200, 400, 600].map((x, i) => (
              <motion.g
                key={i}
                className="cursor-pointer"
                onClick={() => handleElementClick("cross-section")}
                onMouseEnter={() => setHoveredElement("cross-section")}
                onMouseLeave={() => setHoveredElement(null)}
              >
                <line
                  x1={x}
                  y1={180}
                  x2={x}
                  y2={340}
                  stroke="hsl(280, 65%, 55%)"
                  strokeWidth={hoveredElement === "cross-section" || isElementHighlighted("cross-section") ? 4 : 2}
                  strokeDasharray="5 3"
                  opacity={isElementHighlighted("cross-section") ? 1 : 0.8}
                  filter={isElementHighlighted("cross-section") ? "url(#highlight)" : "none"}
                />
                <circle
                  cx={x}
                  cy={180}
                  r={isElementHighlighted("cross-section") ? 8 : 6}
                  fill="hsl(280, 65%, 55%)"
                />
                <text
                  x={x}
                  y={170}
                  textAnchor="middle"
                  fill="hsl(280, 65%, 45%)"
                  fontSize="12"
                  fontWeight="500"
                >
                  XS{i + 1}
                </text>
              </motion.g>
            ))}

            {/* Upstream Node */}
            <motion.g
              className="cursor-pointer"
              onClick={() => handleElementClick("upstream-node")}
              onMouseEnter={() => setHoveredElement("upstream-node")}
              onMouseLeave={() => setHoveredElement(null)}
              whileHover={{ scale: 1.1 }}
              animate={{
                scale: isElementHighlighted("upstream-node") ? 1.2 : 1,
                filter: isElementHighlighted("upstream-node") ? "url(#highlight)" : "none",
              }}
            >
              <circle
                cx="100"
                cy="200"
                r="20"
                fill="hsl(195, 80%, 35%)"
                stroke={isElementHighlighted("upstream-node") ? "hsl(50, 100%, 50%)" : "hsl(195, 80%, 25%)"}
                strokeWidth={isElementHighlighted("upstream-node") ? 4 : 3}
              />
              <text
                x="100"
                y="205"
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontWeight="600"
              >
                US
              </text>
              <text
                x="100"
                y="150"
                textAnchor="middle"
                fill="hsl(195, 80%, 30%)"
                fontSize="12"
                fontWeight="500"
              >
                Upstream
              </text>
            </motion.g>

            {/* Downstream Node */}
            <motion.g
              className="cursor-pointer"
              onClick={() => handleElementClick("downstream-node")}
              onMouseEnter={() => setHoveredElement("downstream-node")}
              onMouseLeave={() => setHoveredElement(null)}
              whileHover={{ scale: 1.1 }}
              animate={{
                scale: isElementHighlighted("downstream-node") ? 1.2 : 1,
                filter: isElementHighlighted("downstream-node") ? "url(#highlight)" : "none",
              }}
            >
              <circle
                cx="700"
                cy="200"
                r="20"
                fill="hsl(195, 80%, 35%)"
                stroke={isElementHighlighted("downstream-node") ? "hsl(50, 100%, 50%)" : "hsl(195, 80%, 25%)"}
                strokeWidth={isElementHighlighted("downstream-node") ? 4 : 3}
              />
              <text
                x="700"
                y="205"
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontWeight="600"
              >
                DS
              </text>
              <text
                x="700"
                y="150"
                textAnchor="middle"
                fill="hsl(195, 80%, 30%)"
                fontSize="12"
                fontWeight="500"
              >
                Downstream
              </text>
            </motion.g>

            {/* Connection lines */}
            <line x1="120" y1="200" x2="150" y2="240" stroke="hsl(195, 80%, 35%)" strokeWidth="2" strokeDasharray="4 2" />
            <line x1="680" y1="200" x2="650" y2="240" stroke="hsl(195, 80%, 35%)" strokeWidth="2" strokeDasharray="4 2" />

            {/* Labels */}
            <text x="400" y="380" textAnchor="middle" fill="hsl(35, 35%, 30%)" fontSize="11">Channel Bed</text>
            <text x="75" y="360" textAnchor="middle" fill="hsl(35, 45%, 40%)" fontSize="11">Left Floodplain</text>
            <text x="725" y="360" textAnchor="middle" fill="hsl(35, 45%, 40%)" fontSize="11">Right Floodplain</text>
          </svg>

          {/* Tutorial Navigation */}
          {isTutorialMode && (
            <div className="mt-4 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={exitTutorial}>
                Exit Tutorial
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevStep} disabled={currentStep === 1}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <Button variant="outline" size="sm" onClick={resetTutorial}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextStep} disabled={currentStep === totalSteps}>
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
          <AnimatePresence mode="wait">
            {isTutorialMode && currentTutorialStep ? (
              <motion.div
                key={`tutorial-${currentStep}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <p className="text-sm text-foreground">{currentTutorialStep.explanation}</p>

                {currentTutorialStep.tip && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground">{currentTutorialStep.tip}</p>
                  </div>
                )}

                {currentTutorialStep.validationQuestion && (
                  <div className="space-y-3 pt-2 border-t border-border">
                    <p className="text-sm font-medium text-foreground">
                      {currentTutorialStep.validationQuestion.question}
                    </p>
                    <div className="space-y-2">
                      {currentTutorialStep.validationQuestion.options.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => !showFeedback && handleAnswerSelect(i)}
                          disabled={showFeedback}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${
                            showFeedback && i === currentTutorialStep.validationQuestion!.correctIndex
                              ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                              : showFeedback && i === selectedAnswer && !isCorrectAnswer
                              ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                              : selectedAnswer === i
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {showFeedback && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`flex items-start gap-2 p-3 rounded-lg ${
                            isCorrectAnswer
                              ? 'bg-green-100 dark:bg-green-950/30'
                              : 'bg-red-100 dark:bg-red-950/30'
                          }`}
                        >
                          {isCorrectAnswer ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                          )}
                          <p className="text-xs">
                            {isCorrectAnswer
                              ? currentTutorialStep.validationQuestion!.feedback.correct
                              : currentTutorialStep.validationQuestion!.feedback.incorrect}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {showFeedback && !isCorrectAnswer && (
                      <Button size="sm" variant="outline" onClick={handleNextStep} className="w-full mt-2">
                        Continue Anyway <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                )}

                {/* Completed badge */}
                {currentStep === totalSteps && completedSteps.length === totalSteps && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center p-4 rounded-lg bg-green-100 dark:bg-green-950/30 border border-green-300"
                  >
                    <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-green-800 dark:text-green-400">Tutorial Complete!</p>
                    <p className="text-xs text-green-700 dark:text-green-500 mt-1">
                      You've learned the fundamentals of 1D river modeling.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ) : selectedElement ? (
              <motion.div
                key={selectedElement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <h3 className="text-lg font-semibold text-foreground">{selectedElement.name}</h3>
                </div>
                <p className="text-muted-foreground mb-6">{selectedElement.description}</p>
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground uppercase tracking-wide">Key Properties</h4>
                  <ul className="space-y-2">
                    {selectedElement.details.map((detail, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-water mt-2 flex-shrink-0" />
                        {detail}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Select an Element</h3>
                <p className="text-sm text-muted-foreground max-w-[200px]">
                  Click on any part of the diagram to learn about its role in river modeling
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
