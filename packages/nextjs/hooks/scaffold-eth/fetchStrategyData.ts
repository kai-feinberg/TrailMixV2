//NOT A REACT HOOK

import { ethers } from 'ethers';
import { Strategy, TokenData, TokenList } from '~~/types/customTypes';
import getTokenData from '~~/hooks/scaffold-eth/useTokenData';
import ercABI from '~~/contracts/erc20ABI.json';
import stratABI from '~~/contracts/strategyABI.json';
import tokenList from '~~/lib/tokenList.json';

// Assuming you have an ethers provider set up, e.g., using Infura, Alchemy, or MetaMask
const provider = new ethers.AlchemyProvider("base", process.env.ALCHEMY_API_KEY);

const strategyABI = stratABI.abi;
const erc20ABI = ercABI.abi;


// Utility function to fetch strategy data for a list of contract addresses
async function fetchStrategyData(contractAddresses: string[], targetNetwork: any): Promise<Strategy[]> {
  if (!contractAddresses || contractAddresses.length === 0) {
    return [];
    }
  const strategies: Strategy[] = [];
  console.log('Fetching strategy data for addresses:', contractAddresses);
  for (const contractAddress of contractAddresses) {
    try {
      const strategyContract = new ethers.Contract(contractAddress, strategyABI, provider);
      // Fetch all necessary data from the strategy contract
      const [
        erc20Address,
        latestPrice,
        erc20Balance,
        stablecoinAddress,
        trailAmount,
        uniswapPool,
        granularity,
        manager,
        tslThreshold
      ] = await Promise.all([
        strategyContract.getERC20TokenAddress(),
        strategyContract.getTwapPrice(),
        strategyContract.getERC20Balance(),
        strategyContract.getStablecoinAddress(),
        strategyContract.getTrailAmount(),
        strategyContract.getUniswapPool(),
        strategyContract.getGranularity(),
        strategyContract.getManager(),
        strategyContract.getTSLThreshold()
      ]);

      // Fetch the ERC20 token data
      const tokenData = (tokenList as TokenList)[targetNetwork.id][erc20Address];

      // Create a strategy object
      const strategy: Strategy = {
        asset: tokenData as TokenData,
        contractAddress,
        erc20Balance: erc20Balance.toString(),
        twapPrice: latestPrice.toString(),
        trailAmount: trailAmount.toString(),
        uniswapPool: uniswapPool.toString(),
        granularity: granularity.toString(),
        manager: manager.toString(),
        tslThreshold: tslThreshold.toString(),
        stablecoinAddress: stablecoinAddress.toString(),
        profit: '0',  // Ignored for now,
        weightedEntryCost: '0' , // Ignored for now
        percentProfit: '0' // Ignored for now
  
      };

      strategies.push(strategy);
    } catch (error) {
      console.error('Failed to fetch strategy data for address:', contractAddress, error);
    }
  }

  console.log('Fetched strategies:', strategies);
  return strategies;
}
export default fetchStrategyData;
