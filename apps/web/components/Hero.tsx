
import React from "react";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block glass-card px-4 py-2 rounded-full mb-4 text-black">
            <span className="text-sm font-medium">
              ✨ Simple yet powerful drawing tools
            </span>
          </div>
          <h1 className="text-6xl font-bold leading-tight text-gradient">
            Create beautiful drawings with ease
          </h1>
          <p className="text-xl max-w-2xl mx-auto text-black">
            A modern drawing application that makes it simple to create, share,
            and collaborate on your ideas in real-time.
          </p>
          <div className="flex items-center justify-center space-x-4 pt-4">
            <Button size="lg" className="bg-primary border-black text-primary-foreground hover:bg-primary/90">
              Try it now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-16 glass-card rounded-lg p-1 animate-float">
          <div className="aspect-video rounded-lg bg-background/80 overflow-hidden">
            <div className="w-full h-full bg-[url('/placeholder.svg')] bg-center bg-cover" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
