import React, { useState } from "react";
import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider(
  "https://mainnet.infura.io/v3/5cf626a98b0349f789b16075424370e7"
);

export const useENS = () => {
  const [names, setNames] = useState('');
  const [image, setImage] = useState('');

  const resolveENS = async (addr) => {
    try {
      const resolvedName = await provider.lookupAddress(addr);
      setNames(resolvedName);
      const resolvedImage = await provider.getAvatar(addr);
      setImage(resolvedImage);
    } catch (error) {
      console.error("Error resolving ENS:", error);
    }
  };

  const resetENS = () => {
    setNames('');
    setImage('');
  };

  return {
    names,
    image,
    resolveENS,
    resetENS,
  };
};
