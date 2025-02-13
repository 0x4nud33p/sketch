
import React from "react";
import NavBar from "../components/NavBar";
import Hero from "../components/Hero";
import Features from "../components/Features";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#18181b] text-foreground text-[#ffffff]">
      <NavBar />
      <Hero />
      <Features />
    </div>
  );
};

export default Index;
