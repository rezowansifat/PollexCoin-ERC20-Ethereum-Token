const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const {
  developmentChains,
  INITIAL_SUPPLY,
} = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("PollexCoin Unit Test", () => {
      const multiplier = 10 ** 18
      let pollexCoin, deployer, user1

      beforeEach(async function () {
        const accounts = await getNamedAccounts()

        deployer = accounts.deployer
        user1 = accounts.user1

        await deployments.fixture("all")
        pollexCoin = await ethers.getContract("PollexCoin", deployer)
      })

      it("Was deployed", async () => {
        assert(pollexCoin.address)
      })

      describe("constructior", () => {
        it("Should have correct INITIAL_SUPPLY of token", async () => {
          const totalSupply = await pollexCoin.totalSupply()
          assert.equal(totalSupply.toString(), INITIAL_SUPPLY)
        })

        it("initializes the token with the correct name and symbol", async () => {
          const name = (await pollexCoin.name()).toString()
          assert.equal(name, "PollexCoin")

          const symbol = (await pollexCoin.symbol()).toString()
          assert.equal(symbol, "POLLEX")
        })

        describe("transfers", () => {
          it("Should be able to transfer tokens successfully to an address", async () => {
            const tokensToSend = ethers.utils.parseEther("10")
            await pollexCoin.transfer(user1, tokensToSend)
            expect(await pollexCoin.balanceOf(user1)).to.equal(tokensToSend)
          })
          it("emits an transfer event, when an transfer occurs", async () => {
            await expect(
              pollexCoin.transfer(user1, (10 * multiplier).toString())
            ).to.emit(pollexCoin, "Transfer")
          })
        })

        describe("allowances", () => {
          const amount = (20 * multiplier).toString()

          beforeEach(async () => {
            playerToken = await ethers.getContract("PollexCoin", user1)
          })

          it("Should approve other address to spend token", async () => {
            const tokensToSpend = ethers.utils.parseEther("5")

            //Deployer is approving that user1 can spend 5 PollexCoin
            await pollexCoin.approve(user1, tokensToSpend)
            await playerToken.transferFrom(deployer, user1, tokensToSpend)
            expect(await playerToken.balanceOf(user1)).to.equal(tokensToSpend)
          })
          it("doesn't allow an unnaproved member to do transfers", async () => {
            await expect(
              playerToken.transferFrom(deployer, user1, amount)
            ).to.be.revertedWith("ERC20: insufficient allowance")
          })
          it("emits an approval event, when an approval occurs", async () => {
            await expect(pollexCoin.approve(user1, amount)).to.emit(
              pollexCoin,
              "Approval"
            )
          })
          it("the allowance being set is accurate", async () => {
            await pollexCoin.approve(user1, amount)
            const allowance = await pollexCoin.allowance(deployer, user1)
            assert.equal(allowance.toString(), amount)
          })
          it("won't allow a user to go over the allowance", async () => {
            await pollexCoin.approve(user1, amount)
            await expect(
              playerToken.transferFrom(
                deployer,
                user1,
                (40 * multiplier).toString()
              )
            ).to.be.revertedWith("ERC20: insufficient allowance")
          })
        })
      })
    })
