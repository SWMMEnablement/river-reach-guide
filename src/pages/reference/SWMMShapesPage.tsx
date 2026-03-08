import { SWMM5ChannelsSection } from "@/components/ChannelVisualizer/SWMM5ChannelsSection";
import { SWMM5ConduitsSection } from "@/components/ChannelVisualizer/SWMM5ConduitsSection";

const SWMMShapesPage = () => (
  <section className="py-10 sm:py-16 lg:py-24">
    <div className="container mx-auto px-4 sm:px-6 max-w-6xl space-y-8">
      <SWMM5ChannelsSection />
      <SWMM5ConduitsSection />
    </div>
  </section>
);

export default SWMMShapesPage;
