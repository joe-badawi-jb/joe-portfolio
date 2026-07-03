import Hero from "./components/sections/Hero";
import CodeRunSection from "./components/sections/CodeRunSection";
import About from "./components/sections/About";
import SoftSkills from "./components/sections/SoftSkills";
import Projects from "./components/sections/Projects";
import TechStack from "./components/sections/TechStack";
import HobbiesTeaser from "./components/sections/HobbiesTeaser";
import Contact from "./components/sections/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <CodeRunSection />
      <About />
      <SoftSkills />
      <Projects />
      <TechStack />
      <HobbiesTeaser />
      <Contact />
    </>
  );
}
