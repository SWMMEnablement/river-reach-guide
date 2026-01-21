import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { RiverReachDiagram } from "@/components/RiverReachDiagram";
import { ModelingSteps } from "@/components/ModelingSteps";
import { ComponentCard } from "@/components/ComponentCard";
import { KnowledgeQuiz } from "@/components/KnowledgeQuiz";
import { ChannelVisualizer } from "@/components/ChannelVisualizer";
import { LearningDashboard } from "@/components/LearningPathways";
import { StoryModeGuide, StoryModeButton } from "@/components/StoryMode";
import { motion } from "framer-motion";
import { 
  Circle, 
  ArrowRight, 
  Layers, 
  Ruler, 
  Waves, 
  Mountain,
  ExternalLink,
  BookOpen,
  GraduationCap,
  PenTool
} from "lucide-react";

const Index = () => {
  const [isStoryModeActive, setIsStoryModeActive] = useState(false);

  const handleNavigateToSection = (sectionId: string) => {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />

      {/* Story Mode Guide */}
      <StoryModeGuide 
        isVisible={isStoryModeActive} 
        onClose={() => setIsStoryModeActive(false)} 
      />

      {/* Learning Pathways Dashboard */}
      <section id="pathways" className="py-10 sm:py-16 lg:py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div />
            <StoryModeButton onClick={() => setIsStoryModeActive(true)} />
          </div>
          <LearningDashboard onNavigateToSection={handleNavigateToSection} />
        </div>
      </section>

      {/* Interactive Diagram Section */}
      <section id="diagram" className="py-10 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              Understanding the River Reach Model
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore the key components of a 1D river reach model. Click on any 
              element to learn about its purpose and configuration.
            </p>
          </motion.div>

          <RiverReachDiagram />
        </div>
      </section>

      {/* Channel Visualizer Section */}
      <section id="editor" className="py-10 sm:py-16 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terrain-light text-terrain text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Interactive Tool
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              Channel Visualizer
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore trapezoidal channel geometry with three visualization modes. 
              Adjust parameters and see real-time Manning's equation calculations.
            </p>
          </motion.div>

          <ChannelVisualizer />
        </div>
      </section>

      {/* Modeling Steps Section */}
      <section id="steps" className="py-10 sm:py-16 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-water-light text-water-dark text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              Step-by-Step Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              Building Your River Reach Model
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Follow these steps to create a complete 1D river reach model in ICM InfoWorks.
              Each step includes detailed instructions and pro tips.
            </p>
          </motion.div>

          <ModelingSteps />
        </div>
      </section>

      {/* Components Reference Section */}
      <section id="components" className="py-10 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-node-light text-node text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              Quick Reference
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              Key Model Components
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Essential elements you'll work with when building river reach models.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <ComponentCard
              icon={<Circle className="w-6 h-6" />}
              title="River Reach Nodes"
              description="Boundary points that define where reaches start and end."
              features={[
                "Inflow boundary conditions",
                "Outflow specifications",
                "Junction connections",
              ]}
              color="water"
            />
            <ComponentCard
              icon={<ArrowRight className="w-6 h-6" />}
              title="River Reach Links"
              description="Channel links connecting nodes with hydraulic properties."
              features={[
                "1D Saint-Venant equations",
                "Conveyance calculations",
                "Storage volume tracking",
              ]}
              color="water"
            />
            <ComponentCard
              icon={<Layers className="w-6 h-6" />}
              title="Cross Sections"
              description="Geometry data defining channel shape at specific locations."
              features={[
                "Survey point data",
                "Bank markers",
                "Roughness zones",
              ]}
              color="node"
            />
            <ComponentCard
              icon={<Ruler className="w-6 h-6" />}
              title="Manning's Roughness"
              description="Resistance coefficients for flow calculations."
              features={[
                "Main channel values",
                "Floodplain values",
                "Seasonal variations",
              ]}
              color="terrain"
            />
            <ComponentCard
              icon={<Waves className="w-6 h-6" />}
              title="Boundary Conditions"
              description="Flow and level inputs that drive the simulation."
              features={[
                "Flow hydrographs",
                "Stage hydrographs",
                "Normal/critical depth",
              ]}
              color="water"
            />
            <ComponentCard
              icon={<Mountain className="w-6 h-6" />}
              title="Floodplains"
              description="Extended storage areas beyond main channel banks."
              features={[
                "Additional storage",
                "Separate roughness",
                "2D zone coupling",
              ]}
              color="terrain"
            />
          </div>
        </div>
      </section>

      {/* Knowledge Quiz Section */}
      <section id="quiz" className="py-10 sm:py-16 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Test Your Knowledge
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              River Modeling Quiz
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Test your understanding of river reach modeling concepts with this 
              interactive quiz. Get immediate feedback on each answer.
            </p>
          </motion.div>

          <KnowledgeQuiz />
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-10 sm:py-16 lg:py-24 bg-gradient-water">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center px-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-white/90 mx-auto mb-4 sm:mb-6" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                Official ICM Documentation
              </h2>
              <p className="text-sm sm:text-base text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Access the complete ICM InfoWorks online help for detailed technical 
                reference, tutorials, and advanced modeling techniques.
              </p>
              <a
                href="https://help.autodesk.com/view/IWICMS/2025/ENU/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-lg font-medium hover:bg-white/90 transition-colors shadow-lg"
              >
                Open ICM Help Documentation
                <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 bg-card border-t border-border safe-area-inset">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Waves className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                ICM River Reach Modeler — Interactive Learning Tool
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for hydraulic engineers and modelers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
