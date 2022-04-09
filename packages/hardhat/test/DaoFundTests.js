const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Test for DAOFund", function () {
  let deployer;
  let user2;
  let user3;
  let user4;
  let user5;

  before(async function () {
    const getAccounts = async function () {
      const accounts = [];
      let signers = [];
      signers = await ethers.getSigners();
      for (const signer of signers) {
        // eslint-disable-next-line no-await-in-loop
        accounts.push({ signer, address: await signer.getAddress() });
      } // populates the accounts array with addresses.
      return accounts;
    };

    // REFACTOR
    [deployer, user2, user3, user4, user5] = await getAccounts();
  });


  before((done) => {
    setTimeout(done, 2000);
  });

  describe("Standard path", function () {
    it("Should deploy DaoFund", async function () {
      const DaoFund = await ethers.getContractFactory("DAOFound");

      daoFundContract = await DaoFund.deploy();
    });

    describe("Mint Tokens", function () {
      it("Should be able to mint a ContributorToken", async function () {

        await daoFundContract.mintContributorToken();

        const numberNFT = await daoFundContract.balanceOf(deployer.address);

        expect(parseInt(numberNFT['_hex'], 16)).to.equal(1);

      });

      it("Shouldn't be able to mint more than one NFT", async function () {

        await expect(daoFundContract.mintContributorToken()).to.be.revertedWith("You already have a Contributor NFT!")

      });

    });

    describe("Create proposal", function () {
      it("Should be able to create proposal if contributor", async function () {

        await expect(daoFundContract.createProposal("Send money to Mexico", user4.address, 50)).to.not.be.reverted;

      });

      it("Shouldn't be able to create proposal if not contributor", async function () {

        await expect(daoFundContract.connect(user2.signer).createProposal("Send money to Poland", user4.address, 50)).to.be.revertedWith("Only users holding Contributor NFTs can access this function!");

      });

    });
    describe("Vote for proposals", function () {
      it("Should be able to vote proposal if contributor", async function () {

        await expect(daoFundContract.voteForProposal(0)).to.not.be.reverted;

      });

      it("Shouldn't be able to vote proposal if not contributor", async function () {

        await expect(daoFundContract.connect(user2.signer).voteForProposal(0)).to.be.revertedWith("Only users holding Contributor NFTs can access this function!");

      });


      it("Shouldn't be able to vote two times", async function () {

        await expect(daoFundContract.voteForProposal(0)).to.be.revertedWith("You have already voted");

      });

    });

    describe("Execute proposals", function () {
      it("Should be able to execute if more than 50% vote for the proposal", async function () {


        await daoFundContract.connect(user2.signer).mintContributorToken();
        await daoFundContract.connect(user3.signer).mintContributorToken();
        await daoFundContract.connect(user4.signer).mintContributorToken();
        await daoFundContract.connect(user5.signer).mintContributorToken();

        await daoFundContract.connect(user2.signer).voteForProposal(0);
        await daoFundContract.connect(user3.signer).voteForProposal(0);
        await daoFundContract.connect(user4.signer).voteForProposal(0);


        await expect(daoFundContract.executeProposal(0)).to.not.be.reverted;


      });

      it("Shouldnt be able to execute if no more than 50% vote for the proposal", async function () {

        await expect(daoFundContract.createProposal("Send money to myself", user4.address, 50)).to.not.be.reverted;


        await daoFundContract.connect(user2.signer).voteForProposal(1);
        await daoFundContract.connect(user3.signer).voteForProposal(1);

        await expect(daoFundContract.executeProposal(1)).to.be.revertedWith("Only proposals with more than 50% YAY votes can be executed!");

      });

    });




  });
});
