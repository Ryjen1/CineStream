import { ethers } from "hardhat";

async function main() {
  // Deploy a new CineStream contract
  console.log("Deploying CineStream contract...");
  const CineStream = await ethers.getContractFactory("CineStream");
  const cineStream = await CineStream.deploy();
  await cineStream.waitForDeployment();
  const contractAddress = await cineStream.getAddress();
  console.log("CineStream deployed to:", contractAddress);

  // Get signers
  const [owner, user1] = await ethers.getSigners();
  console.log("Owner address:", owner.address);
  console.log("User1 address:", user1.address);

  // Verify token details
  const name = await cineStream.name();
  console.log("Token Name:", name);
  if (name !== "CineToken") throw new Error("Invalid token name");

  const symbol = await cineStream.symbol();
  console.log("Token Symbol:", symbol);
  if (symbol !== "CTK") throw new Error("Invalid token symbol");

  const decimals = await cineStream.decimals();
  console.log("Token Decimals:", decimals.toString());
  if (Number(decimals) !== 18) throw new Error(`Invalid token decimals: received ${decimals}`);

  const totalSupply = await cineStream.totalSupply();
  console.log("Total Supply:", ethers.formatUnits(totalSupply, 18), "CTK");
  if (totalSupply !== BigInt(0)) throw new Error("Invalid initial total supply");

  // Verify owner
  const contractOwner = await cineStream.owner();
  console.log("Contract Owner:", contractOwner);
  if (contractOwner !== owner.address) throw new Error("Invalid owner");

  // Add a movie
  const movieTitle = "Demo Movie";
  const movieDescription = "A demo movie for verification";
  const movieUrl = "ipfs://demo-movie";
  console.log(`Adding movie: ${movieTitle}`);
  await cineStream.connect(owner).addMovie(movieTitle, movieDescription, movieUrl);
  console.log("Movie added successfully");

  // Verify movie details
  const [title, description, url] = await cineStream.getMovie(movieTitle);
  console.log("Movie Details:", { title, description, url });
  if (title !== movieTitle || description !== movieDescription || url !== movieUrl) {
    throw new Error("Invalid movie details");
  }

  // Watch movie as user1
  console.log(`User1 watching movie: ${movieTitle}`);
  await cineStream.connect(user1).watchMovie(movieTitle);
  const userBalance = await cineStream.balanceOf(user1.address);
  console.log("User1 Balance:", ethers.formatUnits(userBalance, 18), "CTK");
  if (userBalance !== ethers.parseUnits("10", 18)) throw new Error("Invalid user balance");

  const newTotalSupply = await cineStream.totalSupply();
  console.log("Total Supply after watching:", ethers.formatUnits(newTotalSupply, 18), "CTK");
  if (newTotalSupply !== ethers.parseUnits("10", 18)) throw new Error("Invalid total supply after watching");

  // Test revert conditions
  console.log("Testing revert: Non-owner adding movie");
  try {
    await cineStream.connect(user1).addMovie("Invalid Movie", "Test", "ipfs://invalid");
    throw new Error("Non-owner addMovie did not revert");
  } catch (error: any) {
    console.log("Success: Non-owner addMovie reverted with:", error.message);
  }

  console.log("Testing revert: Watching non-existent movie");
  try {
    await cineStream.connect(user1).watchMovie("Nonexistent Movie");
    throw new Error("Watching non-existent movie did not revert");
  } catch (error: any) {
    console.log("Success: Watching non-existent movie reverted with:", error.message);
  }

  console.log("Verification complete!");
}

main().catch((error) => {
  console.error("Verification failed:", error.message);
  process.exitCode = 1;
});