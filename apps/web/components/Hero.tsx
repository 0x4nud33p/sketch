import React from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Video from "./VideoComponent";

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
            <Link
              href={"/canvas"}
              className="bg-[#fef08a] border lg border-black p-3 rounded-lg text-black hover:bg-[#fef08a]/90 flex items-center"
            >
              Try it now
              <ArrowRight className="ml-1.5 h-5 w-5" />
            </Link>
          </div>
        </div>
        <div className="mt-16 glass-card rounded-lg p-1 animate-float">
          <div className="aspect-video rounded-lg bg-background/80 overflow-hidden">
            {/* <img
            src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzQ5MnNubmRvdHg5aXBreHVtM2E1Z2c1dTEyMjE0MXl2c2tmMHptYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/704WKWDtTjQWIoW7uJ/giphy.gif" 
            alt="Project Demo"
            className="w-full h-full object-cover"
          /> */}
            <Video />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
