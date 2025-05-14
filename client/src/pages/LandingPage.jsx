import React from "react";
import { motion, scale } from "motion/react";
import mainIcon from "../assets/icons/researchly-icon.webp";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AIIcon from "./../assets/icons/ai-icon.svg?react";
import { Zap } from "lucide-react";

function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center max-w-7xl mx-auto">
      <div class="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div class="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]"></div>
      </div>

      {/* Header Section */}
      <motion.section
        className="flex justify-between w-full p-2 gap-4 items-center"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeOut", duration: 0.8 }}
      >
        <div className="flex gap-1 items-center cursor-pointer">
          <img
            src={mainIcon}
            alt="ReSearchly Icon"
            loading="lazy"
            className="size-12"
          />
          <h4 className="-ml-2 text-xl font-medium text-red-500 mb-0.5">
            ReSearchly
          </h4>
        </div>
        <Button variant="linkSign">
          <Link to="/login">Sign In</Link>
        </Button>
      </motion.section>

      {/* Tagline Or Problem Statement Section */}
      <div className="relative mx-auto flex flex-col z-0 items-center justify-center py-16 sm:py-20 lg:pb-28 transition-all animate-in lg:px-12 max-w-7xl opacity-[1]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ ease: "easeOut", duration: 0.8, delay: 0.4 }}
          className="relative w-fit p-[1px] overflow-hidden rounded-full bg-linear-to-r from-rose-200 via-rose-500 to-rose-800 animate-gradient-x group opacity-[1] transform-none"
        >
          <div className="inline-flex items-center border focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent text-secondary-foreground hover:bg-secondary/80 relative px-6 py-2 text-base font-medium bg-white rounded-full group-hover:bg-gray-50 transition-colors">
            <AIIcon />
            <span className="text-red-600 animate-pulse font-semibold">
              {" "}
              AI Powered
            </span>
          </div>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ ease: "easeOut", duration: 0.8, delay: 0.6 }}
          className="text-center font-bold py-12  text-gray-900"
        >
          Research Papers Done{" "}
          <span className="relative inline-block">
            <span className="relative z-10 px-2">Instantly</span>
            <span
              className=" absolute inset-0 bg-red-200/50 transform -skew-1"
              aria-hidden="true"
            ></span>
          </span>
        </motion.h1>
        <motion.h4
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ ease: "easeOut", duration: 0.8, delay: 1 }}
          className="text-gray-600 text-lg max-w-2xl pb-6 text-center"
        >
          Upload a PDF or write a prompt — generate full academic papers
          instantly with AI. Custom formats, clean output, and no manual
          writing.
        </motion.h4>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ ease: "easeOut", duration: 0.8, delay: 1.2 }}
          className="py-8"
        >
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            className="px-6 py-4 text-xl bg-gradient-to-r from-gray-900 text-white font-semibold to-red-400 rounded-full border border-red-300"
          >
            Get to It — Instantly
          </motion.button>
        </motion.div>
      </div>

      {/* Prof of Work or Solution Section */}
      {/* Pricing Section */}
      {/* Cta Section */}
      {/* Footer Section */}
    </div>
  );
}

export default LandingPage;
