export interface TokenData {
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
    pool: string;
    poolFee: string;
  }
  
  
export type Strategy = {
    asset: TokenData;
    contractAddress: string;
    erc20Asset: string;
    erc20Balance: string;
    twapPrice: string;
    trailAmount: string;
    uniswapPool: string;
    granularity: string;
    manager: string;
    tslThreshold: string;
    stablecoinAddress: string;
    stablecoinBalance: string;
    profit: string;
    weightedEntryCost: string;
    percentProfit: string;
    contractState: string;
    stableAsset: TokenData;
    
  };  

  export type TokenList = {
    [chainId: number]: {
        [contractAddress: string]: TokenData;
    };
}