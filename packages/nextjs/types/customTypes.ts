export interface TokenData {
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
    extensions: {
      opListId: string;
      opTokenId: string;
      optimismBridgeAddress?: string;
      baseBridgeAddress?: string;
    };
    pool: string;
  }
  
  
export type Strategy = {
    asset: TokenData;
    contractAddress: string;
    erc20Balance: string;
    twapPrice: string;
    trailAmount: string;
    uniswapPool: string;
    granularity: string;
    manager: string;
    tslThreshold: string;
    stablecoinAddress: string;
    profit: string;
    weightedEntryCost: string;
    percentProfit: string;
  };  

  export type TokenList = {
    [chainId: number]: {
        [contractAddress: string]: TokenData;
    };
}