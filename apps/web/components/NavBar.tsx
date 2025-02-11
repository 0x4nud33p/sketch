"use client";

import React from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const NavBar = () => {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold text-gradient">Sketch</div>
          <div className="flex items-center space-x-6">
            <Button
              onClick={() => router.push("/canvas")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Start Drawing
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
