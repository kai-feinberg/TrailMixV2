import { useState, useEffect } from 'react';
import axios from 'axios';


const useFetchTokenPriceData = (tokenId: string, startingTimestamp: string, currentTimestamp: string) => {
  const [tokenData, setTokenData] = useState<[number,number][] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenData = async () => {
      

      setLoading(true);
      try {
        const options = {
          method: 'GET',
          url: `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart/range?vs_currency=usd&from=${startingTimestamp}&to=${currentTimestamp}&precision=5`,
          headers: {
            accept: 'application/json',
            'x-cg-demo-api-key': 'CG-Twq7dgGwXiwYSRSXwkXcV6uD	'
          }
        };

        const response = await axios.request(options)
        // const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart/range?vs_currency=usd&from=${startingTimestamp}&to=${currentTimestamp}&precision=5`);
        setTokenData(response.data.prices);
      } catch (err) {
        setError('Failed to fetch token data');
      } finally {
        setLoading(false);
      }
    };

    fetchTokenData();
  }, [tokenId]);

  // console.log(tokenData)
  return { tokenData, loading, error };
};

export default useFetchTokenPriceData;
