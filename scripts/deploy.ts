import { ethers } from "hardhat";

async function main() {
  const CineStream = await ethers.getContractFactory("CineStream");
  const cineStream = await CineStream.deploy();
  await cineStream.waitForDeployment();
  console.log("CineStream deployed to:", await cineStream.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});