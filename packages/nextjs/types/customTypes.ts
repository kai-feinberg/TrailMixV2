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
    erc20Balance: string;
    twapPrice: string;
    trailAmount: string;
    uniswapPool: string;
    granularity: string;
    manager: string;
    tslThreshold: string;
    stablecoinAddress: string;
    // entryPrice: string; don't need if we have profit
    profit: string;
  };  