import { StoryModeExperience } from "@/components/StoryMode";

const StoryPage = () => (
  <section className="py-10 sm:py-16 lg:py-24">
    <div className="container mx-auto px-4 sm:px-6">
      <StoryModeExperience isVisible={true} onClose={() => window.history.back()} />
    </div>
  </section>
);

export default StoryPage;
