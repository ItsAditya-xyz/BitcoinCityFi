import React, { useEffect, useState } from "react";

export default function Collage() {
  const [topKeys, setTopKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const imageSize = 48;
  const imagesPerRow = 34;
  async function getTopKeys() {
    let topKeyVar = [];
    let totalAccounts = 0;
    for (let i = 1; i <= 3; i++) {
      const url = `https://api.newbitcoincity.com/api/nbc-keys/tokens?network=nos&page=${i}&limit=500&key_type=1&followers=0,200000&portfolio=1&sort_col=buy_price&sort_type=0`;
      const response = await fetch(url);
      const data = await response.json();
      const resultData = data.result;
      //loop through resultData and push to topKeyVar
      for (let i = 0; i < resultData.length; i++) {
        if (totalAccounts < 1024) {
          topKeyVar.push(resultData[i]);
        }
        totalAccounts++;
      }
    }

    setTopKeys(topKeyVar);
    setIsLoading(false);
  }
  useEffect(() => {
    getTopKeys();
  }, []);

  return (
    <div>
      <div>
        {isLoading && (
          <div className='flex justify-center items-center my-4'>
            <div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500'></div>
          </div>
        )}

<div className="collage-container">
      {topKeys.map((account, index) => (
        <img
          key={index}
          src={account.user_twitter_avatar}
          alt={`Avatar ${index + 1}`}
          style={{
            width: `${imageSize}px`,
            height: `${imageSize}px`,
            margin: '2px', // Adjust the margin as needed
            display: 'inline-block',
          }}
        />
      ))}
    </div>
      </div>
    </div>
  );
}
