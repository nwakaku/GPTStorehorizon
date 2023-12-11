import { ethers } from "hardhat";

async function main() {

  const gptStore = await ethers.deployContract("GPTStore");

  await gptStore.waitForDeployment();

  console.log("GPTStore deployed to:", gptStore.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
