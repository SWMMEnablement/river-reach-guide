import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Check, Circle } from "lucide-react";

interface Step {
  number: number;
  title: string;
  description: string;
  details: string[];
  tip?: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: "Create River Reach Nodes",
    description: "Define the upstream and downstream boundary nodes that will form the endpoints of your river reach.",
    details: [
      "Open GeoPlan view and select the River Reach node tool",
      "Click to place the upstream node at the start of the reach",
      "Place the downstream node at the end of the reach",
      "Set node IDs following your naming convention",
    ],
    tip: "Nodes should be placed at locations where boundary conditions are known or where the river changes significantly.",
  },
  {
    number: 2,
    title: "Draw the River Reach Link",
    description: "Connect the nodes with a river reach link that represents the channel centerline.",
    details: [
      "Select the River Reach link tool from the toolbar",
      "Click on the upstream node to start the link",
      "Add intermediate vertices to follow the river alignment",
      "Click on the downstream node to complete the link",
    ],
    tip: "The link path should follow the deepest part of the channel (thalweg) for accurate hydraulic calculations.",
  },
  {
    number: 3,
    title: "Define Cross Sections",
    description: "Add surveyed cross-section data along the reach to define the channel geometry.",
    details: [
      "Open the River Reach properties and navigate to Section Data",
      "Add cross-sections at regular intervals and significant locations",
      "Enter chainage and elevation data for each section",
      "Mark left bank, right bank, and bed positions",
    ],
    tip: "More cross-sections provide better accuracy but increase computation time. Focus on areas of significant geometric change.",
  },
  {
    number: 4,
    title: "Set Roughness Coefficients",
    description: "Assign Manning's n values to represent channel and floodplain resistance.",
    details: [
      "Define roughness zones: left bank, main channel, right bank",
      "Assign Manning's n values based on channel characteristics",
      "Consider seasonal variations if applicable",
      "Use published values or calibrate against observed data",
    ],
    tip: "Typical values: concrete (0.013), gravel (0.025), vegetated floodplain (0.05-0.15).",
  },
  {
    number: 5,
    title: "Configure Boundary Conditions",
    description: "Set up inflow and outflow conditions at the reach endpoints.",
    details: [
      "Select the upstream node and define inflow hydrograph or constant flow",
      "Select the downstream node and set the outflow condition",
      "Common downstream conditions: normal depth, known stage, tidal curve",
      "Link to external time series data if available",
    ],
    tip: "For subcritical flow, the downstream condition controls the backwater profile.",
  },
  {
    number: 6,
    title: "Run Simulation & Validate",
    description: "Execute the hydraulic simulation and compare results with observations.",
    details: [
      "Set simulation timestep appropriate for the reach length",
      "Run the simulation and monitor for stability warnings",
      "Review water level and flow results at key locations",
      "Compare with observed data and adjust parameters if needed",
    ],
    tip: "If results oscillate or show instability, reduce the timestep or check for abrupt geometry changes.",
  },
];

export const ModelingSteps = () => {
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => setExpandedStep(expandedStep === step.number ? null : step.number)}
              className="w-full px-6 py-5 flex items-center gap-4 text-left hover:bg-secondary/30 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  expandedStep === step.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {step.number}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform ${
                  expandedStep === step.number ? "rotate-180" : ""
                }`}
              />
            </button>

            {expandedStep === step.number && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 pb-6"
              >
                <div className="pl-14 space-y-4">
                  <ul className="space-y-3">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-water-light flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-water-dark" />
                        </div>
                        <span className="text-sm text-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>

                  {step.tip && (
                    <div className="bg-secondary/50 rounded-lg p-4 border-l-4 border-primary">
                      <div className="flex items-start gap-2">
                        <Circle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                            Pro Tip
                          </span>
                          <p className="text-sm text-muted-foreground mt-1">{step.tip}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
