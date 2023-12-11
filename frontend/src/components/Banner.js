// Banner.js
import React from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Banner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-l from-purple-800 via-black to-white text-white flex items-center justify-center">
      <div className="text-center flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
          AI GPT Marketplace for Web3
        </h1>
        <p className="text-lg md:text-xl mb-8">
          Explore the power of AI with GPT technology in the decentralized web.
        </p>

        <a className="mx-auto" href="/marketplace">
          {/* <ConnectButton label="Get Started" chainStatus="none" accountStatus="avatar" /> */}
        </a>
      </div>
    </div>
  );
};

export default Banner;
