import { useState, useEffect } from 'react';
import axios from 'axios';
import { Strategy } from '~~/types/customTypes';
import { start } from 'nprogress';


const useFetchTokenPriceData = (strategy: Strategy, onDataFetched: any) => {
  const [tokenData, setTokenData] = useState<[number,number][] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


   // Function to round timestamp to the nearest hour (always rounding down)
   const roundToNearestHour = (timestamp: number): number => {
    return Math.floor(timestamp / 3600) * 3600;
  };

  // Round current timestamp to the nearest hour
  const currentTimestamp = roundToNearestHour(Math.floor(Date.now()/1000));
  // Round starting timestamp to the nearest hour
  const startingTimestamp = roundToNearestHour(Number(strategy.dateCreated));
  console.log("date created", strategy.dateCreated, "rounded number", startingTimestamp);
  console.log("current", currentTimestamp);

  // const currentTimestamp = Date.now()
  // const startingTimestamp = strategy.dateCreated
  const tokenId = strategy.asset.coinGeckoId

  useEffect(() => {
    const fetchTokenData = async () => {
      if (tokenId !==''){
      
      setLoading(true);
      try {
        const options = {
          method: 'GET',
          // url: `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart/range?vs_currency=usd&from=${1721188800}&to=${1721955600}&precision=3`,
          url: `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart/range?vs_currency=usd&from=${startingTimestamp}&to=${currentTimestamp}&precision=3`,
          headers: {
            accept: 'application/json',
            'x-cg-demo-api-key': 'CG-Twq7dgGwXiwYSRSXwkXcV6uD	'
          }
        };
        const response = await axios.request(options)
        // console.log("requesting api. Data: ", response.data)
        console.log(`Requesting API data from ${new Date(Number(startingTimestamp))} to ${new Date(currentTimestamp*1000)}`);
        // console.log(`Requesting API data from ${Number(startingTimestamp)} to ${(currentTimestamp)}`);
        // console.log("requesting api for token", tokenId)
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
