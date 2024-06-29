const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Forked Network Verification", function () {
  it("should verify the network is forked", async function () {
    const provider = ethers.provider;

    // Check block number
    const blockNumber = await provider.getBlockNumber();
    console.log("Current block number:", blockNumber);
    // Optionally, check if the block number is within a reasonable range

    // Check network details
    const network = await provider.getNetwork();
    console.log("Network information:", network);
    // Example check for Ethereum mainnet chain ID
    // Adjust the chain ID based on the network you are forking

    // Check balance of a known address
    const address = "0x2cb509BE01144aF14FCF944957c401C14c6dF722"; // Replace with a known address with a balance
    const balance = await provider.getBalance(address);
    console.log("Balance of address", address, "is", ethers.utils.formatEther(balance), "ETH");
  });
});

describe("TrailMixManager", function () {
  let trailMixManager;
  let deployer;
  let user;
  let erc20Token;
  let stablecoin;
  let trailMixAddress;

  before(async () => {
    [deployer, user] = await ethers.getSigners();

    const TrailMixManager = await ethers.getContractFactory("TrailMixManager");
    const routerAddress = "0xUniswapV3RouterAddress"; // Replace with actual Uniswap V3 Router address on Base
    const wethAddress = "0xWETHAddress"; // Replace with actual WETH address on Base
    const erc20TokenAddress = "0xERC20TokenAddress"; // Replace with actual ERC20 token address
    const stablecoinAddress = "0xStablecoinAddress"; // Replace with actual stablecoin address
    const poolFee = 3000; // Example pool fee

    // Deploy TrailMixManager contract
    trailMixManager = await TrailMixManager.deploy();

    // Assuming you have ERC20 token and Stablecoin contracts
    erc20Token = await ethers.getContractAt("IERC20", erc20TokenAddress);
    stablecoin = await ethers.getContractAt("IERC20", stablecoinAddress);

    // Deploy a TrailMix contract through the manager
    await trailMixManager.deployTrailMix(
      erc20TokenAddress,
      stablecoinAddress,
      routerAddress,
      "0xUniswapPoolAddress", // Replace with actual Uniswap pool address
      "0xUniswapOracleAddress", // Replace with actual Uniswap oracle address
      10,
      1,
      poolFee
    );

    // Get the address of the deployed TrailMix contract
    const userContracts = await trailMixManager.getUserContracts(deployer.address);
    trailMixAddress = userContracts[0];
  });

  it("should deposit funds into TrailMix contract", async () => {
    const amount = ethers.utils.parseUnits("10", 18); // Adjust the amount as needed
    const tslThreshold = 5; // Example TSL threshold

    // Transfer ERC20 tokens to the deployer to simulate funding
    await erc20Token.transfer(deployer.address, amount);

    // Approve TrailMixManager to spend tokens
    await erc20Token.approve(trailMixManager.address, amount);

    // Deposit tokens into TrailMix
    await trailMixManager.deposit(trailMixAddress, amount, tslThreshold);

    // Verify the deposit
    const trailMix = await ethers.getContractAt("TrailMix", trailMixAddress);
    const trailMixBalance = await trailMix.getERC20Balance();
    expect(trailMixBalance).to.equal(amount);
  });

  it("should swap tokens on Uniswap", async () => {
    const trailMix = await ethers.getContractAt("TrailMix", trailMixAddress);

    // Get initial stablecoin balance
    const initialStablecoinBalance = await stablecoin.balanceOf(trailMixAddress);

    // Perform the swap
    const amountToSwap = ethers.utils.parseUnits("1", 18); // Adjust the amount as needed
    await trailMix.swapOnUniswap(amountToSwap);

    // Get new stablecoin balance
    const newStablecoinBalance = await stablecoin.balanceOf(trailMixAddress);

    // Verify that the stablecoin balance has increased
    expect(newStablecoinBalance).to.be.gt(initialStablecoinBalance);
  });
});
