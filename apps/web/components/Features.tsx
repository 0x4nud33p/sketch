
import React from "react";
import { Card } from "@repo/ui/card";
import { Layers, Palette, Download, Share2 } from "lucide-react";

const features = [
  {
    icon: <Layers className="h-6 w-6" />,
    title: "Infinite Canvas",
    description: "Draw without boundaries on our unlimited canvas space",
  },
  {
    icon: <Palette className="h-6 w-6" />,
    title: "Rich Tools",
    description: "Access a wide range of drawing tools and shapes",
  },
  {
    icon: <Download className="h-6 w-6" />,
    title: "Export Options",
    description: "Export your work in multiple formats instantly",
  },
  {
    icon: <Share2 className="h-6 w-6" />,
    title: "Collaboration",
    description: "Work together in real-time with your team",
  },
];

const Features = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gradient mb-4">
            Everything you need to create
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Powerful features that help you bring your ideas to life
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="glass-card p-6 transition-transform hover:-translate-y-1 duration-300"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-black">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
