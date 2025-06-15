"use client";

import React from "react";
import Link from "next/link";

const NavBar = () => {

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass bg-[#27272a]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold text-gradient">Sketch</div>
          <div className="flex items-center space-x-6">
            <Link
              href={"/canvas"}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Start Drawing
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
