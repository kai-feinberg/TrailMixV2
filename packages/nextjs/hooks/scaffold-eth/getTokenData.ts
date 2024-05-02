import tokenList from '../../lib/tokenList.json';
import { useTargetNetwork } from '~~/hooks/scaffold-eth/useTargetNetwork';

// Assuming the structure of tokenList is as follows:
// {
//   [chainId: number]: {
//     [contractAddress: string]: { // Token data structure }
//   }
// }

interface TokenData {
    [key: string]: any;  // Replace 'any' with a more specific type based on your token data structure
}

interface TokenList {
    [chainId: number]: {
        [contractAddress: string]: TokenData;
    };
}


/**
 * Fetches token data based on the contract address and the current network's chain ID.
 * @param {string} contractAddress - The contract address of the token.
 * @returns {TokenData|undefined} The token data if found, otherwise undefined.
 */
export default function getTokenData(contractAddress: string): TokenData | undefined {
    const { targetNetwork } = useTargetNetwork();
    const chainId = targetNetwork?.id;

    if (chainId && (tokenList as TokenList)[chainId]?.[contractAddress]) {
        return (tokenList as TokenList)[chainId][contractAddress];
    }

    return undefined; // Return undefined if no data is found
}
