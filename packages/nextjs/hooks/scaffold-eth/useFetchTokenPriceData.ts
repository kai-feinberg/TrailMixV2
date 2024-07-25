import { useState, useEffect } from 'react';
import axios from 'axios';
import { Strategy } from '~~/types/customTypes';


const useFetchTokenPriceData = (strategy: Strategy, onDataFetched: any) => {
  const [tokenData, setTokenData] = useState<[number,number][] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  const currentTimestamp = Date.now()
  const startingTimestamp = strategy.dateCreated
  const tokenId = strategy.asset.coinGeckoId

  useEffect(() => {
    const fetchTokenData = async () => {
      if (tokenId !==''){
      
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
        // console.log("requesting api. Data: ", response.data.prices)
        setTokenData(response.data.prices);
      } catch (err) {
        console.log(err)
        setError('Failed to fetch token data');
      } finally {
        setLoading(false);
      }
    }
    };


    fetchTokenData();

    if (!loading){   
       onDataFetched(tokenData)
    }
  }, [tokenId]);

  // console.log(tokenData)
  return { tokenData, loading, error };
};

export default useFetchTokenPriceData;
