import { useState, useEffect } from 'react';
import axios from 'axios';

interface TokenPriceResponse {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  sparkline_in_7d: { price: number[] };
}

const useFetchTokenPrice = (tokenId: string) => {
  const [tokenData, setTokenData] = useState<TokenPriceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenData = async () => {
      setLoading(true);
      try {
        //use hook to get price data since time from first deposit
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${tokenId}`);
        setTokenData(response.data);
      } catch (err) {
        setError('Failed to fetch token data');
      } finally {
        setLoading(false);

        //callback to update price data? 
        // update price data iff not yet fetched for the strategy
        // 
      }
    };

    fetchTokenData();
  }, [tokenId]);

  return { tokenData, loading, error };
};

export default useFetchTokenPrice;
