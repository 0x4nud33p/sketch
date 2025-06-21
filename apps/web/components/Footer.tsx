"use client";

import { motion } from "framer-motion";
import { Github, Twitter, Mail } from "lucide-react";
import Link from "next/link";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const Footer = () => {
  return (
    <footer className="bg-[#18181b] px-6">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
        className="max-w-7xl mx-auto py-10 flex flex-col md:flex-row justify-between items-center gap-6"
      >
        <div className="text-center md:text-left text-sm text-[#ffffff]">
          © {new Date().getFullYear()} Sketch — All rights reserved.
        </div>

        <div className="flex gap-6 text-[#ffffff]">
          <Link
            href="https://github.com/0x4nud33p/sketch"
            target="_blank"
            className="hover:text-slate-400 transition-colors"
          >
            <Github className="h-5 w-5" />
          </Link>
          <Link
            href="https://twitter.com/0x4nud33p"
            target="_blank"
            className="hover:text-slate-400 transition-colors"
          >
            <Twitter className="h-5 w-5" />
          </Link>
          <Link
            href="mailto:anudeepavula009@gmail.com"
            className="hover:text-slate-400 transition-colors"
          >
            <Mail className="h-5 w-5" />
          </Link>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
