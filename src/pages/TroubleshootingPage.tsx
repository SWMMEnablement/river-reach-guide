import { TroubleshootingSection } from "@/components/ChannelVisualizer/TroubleshootingSection";
import { TroubleshootingAIChat } from "@/components/ChannelVisualizer/TroubleshootingAIChat";
import { HydraulicsAIChat } from "@/components/ChannelVisualizer/HydraulicsAIChat";
import { Calculator } from "lucide-react";

const TroubleshootingPage = () => (
  <section className="py-10 sm:py-16 lg:py-24">
    <div className="container mx-auto px-4 sm:px-6 max-w-6xl space-y-8">
      {/* AI Assistants */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">AI-Powered Assistants</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Get instant help from AI specialists for troubleshooting modeling issues or learning hydraulic concepts.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TroubleshootingAIChat />
          <HydraulicsAIChat />
        </div>
      </div>

      <TroubleshootingSection />
    </div>
  </section>
);

export default TroubleshootingPage;
