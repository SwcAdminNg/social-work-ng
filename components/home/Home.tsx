import Hero from "./Hero";
import HomeContact from "./HomeContact";
import HomeFAQ from "./HomeFAQ";
import Intro from "./Intro";
import LearningApproach from "./LearningApproach";
import LearningCategories from "./LearningCategories";
import LearningCTA from "./LearningCTA";
import LearningOptions from "./LearningOptions";
import SectionIndex from "./SectionIndex";
import Services from "./Services";

export default function Home() {
  return (
    <>
      <SectionIndex />
      <Hero />
      <Intro />
      <Services />
      <LearningApproach />
      <LearningOptions />
      <LearningCategories />
      <LearningCTA />
      <HomeFAQ />
      <HomeContact />
    </>
  );
}
