"use client";

import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { authClient } from "../../../lib/auth-client";
import { motion } from "framer-motion";
import { FaGoogle } from "react-icons/fa";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SignUpWithGoogle() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (error) {
      console.error("Google sign up failed:", error);
      toast.error("Google sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center bg-[#18181b] items-center min-h-screen w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[95%] mx-auto md:w-[22vw] shadow-sm md:shadow-lg bg-[#27272a] text-white">
          <CardHeader className="space-y-1">
            <CardTitle className="md:text-2xl text-xl font-bold text-center">
              Sign In
            </CardTitle>
            <CardDescription className="text-center">
              Sign In using your Google account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
            className="w-full bg-[#fef08a] text-black border border-black p-3 rounded-lg flex items-center justify-center hover:bg-[#fef08a]/90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            onClick={handleGoogleSignUp}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <FaGoogle className="mr-2 h-4 w-4 cursor-pointer" />
            )}
            Sign In with Google
          </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}