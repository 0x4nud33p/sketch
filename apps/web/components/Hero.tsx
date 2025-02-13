
import React from "react";
import { Button } from "@repo/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block glass-card px-4 py-2 rounded-full mb-4 text-black">
            <span className="text-sm p-2 rounded-xl font-medium bg-[#27272a] text-white">
              ✨ Simple yet powerful drawing tools
            </span>
          </div>
          <h1 className="text-6xl font-bold leading-tight text-gradient">
            Create drawings with ease
          </h1>
          <p className="text-xl max-w-2xl mx-auto text-white">
            A modern drawing application that makes it simple to create, share,
            and collaborate on your ideas in real-time.
          </p>
          <div className="flex items-center justify-center space-x-2 pt-4">
            <Button
              size="lg"
              className="bg-[#fef08a] border border-black p-3 rounded-lg text-black hover:bg-[#fef08a]/90 flex items-center"
            >
              Try it now 
              <ArrowRight className="ml-1.5 h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="mt-16 glass-card rounded-lg p-1 animate-float">
          <div className="aspect-video rounded-lg bg-background/80 overflow-hidden">
            <div className="w-full h-full bg-[url('https://picsum.photos/seed/picsum/200/300')] bg-center bg-cover" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
