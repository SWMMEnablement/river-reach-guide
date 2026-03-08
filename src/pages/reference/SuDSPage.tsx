import { SuDSSection } from "@/components/ChannelVisualizer/SuDSSection";
import { LIDControlsSection } from "@/components/ChannelVisualizer/LIDControlsSection";

const SuDSPage = () => (
  <section className="py-10 sm:py-16 lg:py-24">
    <div className="container mx-auto px-4 sm:px-6 max-w-6xl space-y-8">
      <SuDSSection />
      <LIDControlsSection />
    </div>
  </section>
);

export default SuDSPage;
