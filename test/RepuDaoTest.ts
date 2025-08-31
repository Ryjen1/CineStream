// import { expect } from "chai";
// import { ethers } from "hardhat";
// import { time } from "@nomicfoundation/hardhat-network-helpers";

// describe("RepuDao System", function () {
//     let owner: any;
//     let member1: any;
//     let member2: any;
//     let nonMember: any;

//     before(async function () {
//         [owner, member1, member2, nonMember] = await ethers.getSigners();
//     });

//     async function deployDAO() {
//         const DAOFactory = await ethers.getContractFactory("DAOFactory");
//         const factory = await DAOFactory.deploy();
//         const tx = await factory.createDAO();
//         const receipt = await tx.wait();

//         const event = receipt!.logs
//             .map((log: any) => {
//                 try {
//                     return factory.interface.parseLog(log);
//                 } catch {
//                     return null;
//                 }
//             })
//             .find((e: any) => e && e.name === "DAOCreated");

//         const nftAddress = event?.args?.membershipNFT ?? ethers.ZeroAddress;
//         const daoAddress = event?.args?.repuDao ?? ethers.ZeroAddress;

//         const membershipNFT = await ethers.getContractAt("MembershipNFT", nftAddress);
//         const repuDao = await ethers.getContractAt("RepuDao", daoAddress);

//         return { membershipNFT, repuDao };
//     }

//     it("Should deploy DAO and NFT via factory", async function () {
//         const { membershipNFT, repuDao } = await deployDAO();

//         expect(await membershipNFT.getAddress()).to.not.equal(ethers.ZeroAddress);
//         expect(await repuDao.getAddress()).to.not.equal(ethers.ZeroAddress);
//     });

//     it("Should allow owner to mint NFTs and members to vote with correct weights", async function () {
//         const { repuDao } = await deployDAO();

//         // mint as owner
//         await repuDao.connect(owner).mint(member1.address);
//         await time.increase(30 * 24 * 60 * 60);
//         await repuDao.connect(owner).mint(member2.address);

//         // create proposal
//         await repuDao.connect(owner).createProposal("Test Proposal");

//         // members vote
//         await repuDao.connect(member1).vote(1);
//         await repuDao.connect(member2).vote(1);

//         const [, , voteCount] = await repuDao.getResults(1);
//         expect(voteCount).to.equal(3, "Vote count should be 3 (2 + 1)");
//     });

//     it("Should prevent double voting", async function () {
//         const { repuDao } = await deployDAO();

//         await repuDao.connect(owner).mint(member1.address);
//         await repuDao.connect(owner).createProposal("Test Proposal");

//         await repuDao.connect(member1).vote(1);
//         await expect(repuDao.connect(member1).vote(1))
//             .to.be.revertedWithCustomError(repuDao, "AlreadyVoted")
//             .withArgs(member1.address);
//     });

//     it("Should assign correct vote weights based on holding time", async function () {
//         const { repuDao } = await deployDAO();

//         await repuDao.connect(owner).mint(member1.address);
//         await time.increase(90 * 24 * 60 * 60);

//         await repuDao.connect(owner).createProposal("Long-term Proposal");
//         await repuDao.connect(member1).vote(1);

//         const [, , voteCount] = await repuDao.getResults(1);
//         expect(voteCount).to.equal(3, "Vote count should be 3 for ≥3 months");
//     });

//     it("Should revert for non-NFT holders", async function () {
//         const { repuDao } = await deployDAO();

//         await repuDao.connect(owner).createProposal("Test Proposal");

//         await expect(repuDao.connect(nonMember).vote(1))
//             .to.be.revertedWithCustomError(repuDao, "NotNFTHolder")
//             .withArgs(nonMember.address);
//     });
// });
