import Hero from "./Hero";
import HomeContact from "./HomeContact";
import HomeFAQ from "./HomeFAQ";
import Intro from "./Intro";
import Learning from "./Learning";
import LearningCategories from "./LearningCategories";
import LearningCTA from "./LearningCTA";
import { ScrollProgress } from "./motion";
import ScrollMarquee from "./ScrollMarquee";
import Services from "./Services";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Hero />
      <Intro />
      <ScrollMarquee />
      <Services />
      <Learning />
      <LearningCategories />
      <LearningCTA />
      <HomeFAQ />
      <HomeContact />
    </>
  );
}
