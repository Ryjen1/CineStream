import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("CineStream Contract", function () {
  let cineStream: any;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  const movieTitle = "Test Movie";
  const movieDescription = "A test movie description";
  const movieUrl = "ipfs://test-movie";
  const TOKENS_PER_MOVIE = ethers.parseUnits("10", 18);

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const CineStreamFactory = await ethers.getContractFactory("CineStream");
    cineStream = await CineStreamFactory.deploy();
    await cineStream.waitForDeployment();
  });

  describe("Token Details", function () {
    it("should have correct token details", async function () {
      expect(await cineStream.name()).to.equal("CineToken");
      expect(await cineStream.symbol()).to.equal("CTK");
      expect(await cineStream.decimals()).to.equal(18);
      expect(await cineStream.totalSupply()).to.equal(0);
    });
  });

  describe("addMovie", function () {
    it("should allow owner to add a movie", async function () {
      await expect(
        cineStream.connect(owner).addMovie(movieTitle, movieDescription, movieUrl)
      )
        .to.emit(cineStream, "MovieAdded")
        .withArgs(movieTitle, movieDescription, movieUrl);

      const [title, description, url] = await cineStream.getMovie(movieTitle);
      expect(title).to.equal(movieTitle);
      expect(description).to.equal(movieDescription);
      expect(url).to.equal(movieUrl);
    });

    it("should revert if non-owner tries to add a movie", async function () {
      await expect(
        cineStream.connect(user1).addMovie(movieTitle, movieDescription, movieUrl)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("should revert if movie title is empty", async function () {
      await expect(
        cineStream.connect(owner).addMovie("", movieDescription, movieUrl)
      ).to.be.revertedWith("Title cannot be empty");
    });

    it("should revert if movie already exists", async function () {
      await cineStream.connect(owner).addMovie(movieTitle, movieDescription, movieUrl);
      await expect(
        cineStream.connect(owner).addMovie(movieTitle, movieDescription, movieUrl)
      ).to.be.revertedWith("Movie already exists");
    });
  });

  describe("removeMovie", function () {
    it("should allow owner to remove a movie", async function () {
      await cineStream.connect(owner).addMovie(movieTitle, movieDescription, movieUrl);
      await expect(cineStream.connect(owner).removeMovie(movieTitle))
        .to.emit(cineStream, "MovieRemoved")
        .withArgs(movieTitle);
      await expect(cineStream.getMovie(movieTitle)).to.be.revertedWith("Movie does not exist");
    });

    it("should revert if non-owner tries to remove a movie", async function () {
      await cineStream.connect(owner).addMovie(movieTitle, movieDescription, movieUrl);
      await expect(
        cineStream.connect(user1).removeMovie(movieTitle)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("should revert if movie does not exist", async function () {
      await expect(
        cineStream.connect(owner).removeMovie(movieTitle)
      ).to.be.revertedWith("Movie does not exist");
    });
  });

  describe("watchMovie", function () {
    beforeEach(async function () {
      await cineStream.connect(owner).addMovie(movieTitle, movieDescription, movieUrl);
    });

    it("should reward tokens and track watched movies", async function () {
      await expect(cineStream.connect(user1).watchMovie(movieTitle))
        .to.emit(cineStream, "TokensRewarded")
        .withArgs(user1.address, movieTitle, TOKENS_PER_MOVIE);

      expect(await cineStream.balanceOf(user1.address)).to.equal(TOKENS_PER_MOVIE);
      expect(await cineStream.totalSupply()).to.equal(TOKENS_PER_MOVIE);
      expect(await cineStream.hasWatched(user1.address, movieTitle)).to.be.true;
    });

    it("should revert if movie does not exist", async function () {
      await expect(cineStream.connect(user1).watchMovie("Nonexistent Movie"))
        .to.be.revertedWith("Movie does not exist");
    });

    it("should revert if user already watched the movie", async function () {
      await cineStream.connect(user1).watchMovie(movieTitle);
      await expect(cineStream.connect(user1).watchMovie(movieTitle))
        .to.be.revertedWith("Movie already watched by user");
    });
  });

  describe("getMovie", function () {
    it("should return movie details", async function () {
      await cineStream.connect(owner).addMovie(movieTitle, movieDescription, movieUrl);
      const [title, description, url] = await cineStream.getMovie(movieTitle);
      expect(title).to.equal(movieTitle);
      expect(description).to.equal(movieDescription);
      expect(url).to.equal(movieUrl);
    });

    it("should revert if movie does not exist", async function () {
      await expect(cineStream.getMovie(movieTitle)).to.be.revertedWith("Movie does not exist");
    });
  });
});