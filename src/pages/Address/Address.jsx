import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import { Chart } from "react-chartjs-2";
import toast, { Toaster } from "react-hot-toast";

function Address(props) {
  const { address } = useParams();
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [chart, setChart] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);
  const [profileInfo, setProfileInfo] = useState({});
  const [usernameInfo, setUsernameInfo] = useState({});

  const [twitterUsername, setTwitterUsername] = useState("");

  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [portfolioData, setPortfolioData] = useState(null);

  const [netPortfolio, setNetPortfolio] = useState({});

  async function getPrice() {
    let URL = `https://api.newbitcoincity.com/api/nbc-keys/chart/data?day=190&address=${address}`;
    let response = await fetch(URL);
    let data = await response.json();

    // sort the list with the time in trade_time, trade time is in "2023-10-13T16:45:00Z" format

    const groupedData = {};
    const resultData = data.result;
    console.log(resultData);

    resultData.forEach((item) => {
      const date = item.trade_time.split("T")[0]; // Extract date
      if (!groupedData[date] || item.price_usd > groupedData[date].price_usd) {
        groupedData[date] = item;
      }
    });

    let bottomData = {};
    resultData.forEach((item) => {
      const date = item.trade_time.split("T")[0]; // Extract date
      if (!bottomData[date] || item.price_usd < bottomData[date].price_usd) {
        bottomData[date] = item;
      }
    });

    const newPriceData = Object.values(groupedData);
    const bottomPriceData = Object.values(bottomData);
    console.log(newPriceData);
    const sorted = [...newPriceData].sort(
      (a, b) => new Date(a.trade_time) - new Date(b.trade_time)
    );

    const bottomSorted = [...bottomPriceData].sort(
      (a, b) => new Date(a.trade_time) - new Date(b.trade_time)
    );

    console.log(sorted);

    const timeLabels = sorted.map((item) =>
      new Date(item.trade_time).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    );
    const prices = sorted.map((item) => item.price_usd);

    const bottomPrices = bottomSorted.map((item) => item.price_usd);

    let dataVar = {
      labels: timeLabels,
      datasets: [
        {
          label: "Highest Price on that day",
          data: prices,
          fill: true,
          backgroundColor: "rgba(75,192,192,0.2)",
          borderColor: "rgba(75,192,192,1)",
        },
        {
          label: "Lowest Price on that day",
          data: bottomPrices,
          fill: false,

          borderColor: "#FF7F7F",
        },
      ],
    };
    setChartData(dataVar);

    const profileURL = `https://alpha-api.newbitcoincity.com/api/player-share/profile?network=nos&address=${address}`;

    const profileResponse = await fetch(profileURL);
    const profileData = await profileResponse.json();
    const profileInfoVar = profileData.result;
    setTwitterUsername(profileInfoVar.twitter_username);

    const usernameSearch = `https://alpha-api.newbitcoincity.com/api/player-share/tokensv1?network=nos&page=1&limit=30&key_type=1&side=1&followers=0,200000&price_usd=0,1000&sort_col=created_at&sort_type=0&holder=0&placeholder=0&price=0,1000&search=${profileInfoVar.twitter_username}`;
    const usernameResponse = await fetch(usernameSearch);
    const usernameData = await usernameResponse.json();
    const usernameInfoVar = usernameData.result[0];
    console.log(usernameInfoVar);
    setUsernameInfo(usernameInfoVar);
    setProfileInfo(profileInfoVar);
    setLoading(false);

    const portfolioURL = `https://alpha-api.newbitcoincity.com/api/player-share/holding?address=${address}&page=1&limit=2000&network=nos`;
    const portfolioResponse = await fetch(portfolioURL);
    const portfolioData = await portfolioResponse.json();
    const portfolioInfoVar = portfolioData.result;
    let finalportfolioInfoVar = [];
    let totalInvested = 0;
    let totalCurrent = 0;
    for (let i = 0; i < portfolioInfoVar.length; i++) {
      if (portfolioInfoVar[i].ft_balance != "1") {
        let currentItem = portfolioInfoVar[i];
        let currentValue =
          Math.round(
            (parseFloat(currentItem.usd_price) *
              parseFloat(currentItem.balance) -
              (10 * parseFloat(currentItem.usd_price)) / 100) *
              100
          ) / 100;
        currentItem.currentValue =
          currentValue > 0 ? `$${currentValue}` : `-$${Math.abs(currentValue)}`;
        let boughtValue =
          Math.round(
            parseFloat(currentItem.usd_buy_price) *
              parseFloat(currentItem.balance) *
              100
          ) / 100;
        totalCurrent += currentValue;
        totalInvested += boughtValue;
        let pnl = currentValue - boughtValue;
        currentItem.pnl =
          pnl > 0
            ? `${Math.round((pnl / boughtValue) * 1000) / 10}`
            : `-${Math.round(Math.abs(pnl / boughtValue) * 1000) / 10}`;
        let isGreen = pnl > 0 ? true : false;
        currentItem.isGreen = isGreen;

        finalportfolioInfoVar.push(currentItem);
      }
    }


    

    setNetPortfolio({
      totalInvested: totalInvested,
      totalCurrent: totalCurrent,
     
    });

    console.log(portfolioInfoVar);
    setPortfolioData(finalportfolioInfoVar);
    setLoadingPortfolio(false);
  }

  async function handleSearch() {
    const url = `https://alpha-api.newbitcoincity.com/api/player-share/tokensv1?network=nos&page=1&limit=30&key_type=1&side=1&followers=0,200000&price_usd=0,1000&sort_col=created_at&sort_type=0&holder=0&placeholder=0&price=0,1000&search=${twitterUsername}`;
    if (!twitterUsername) {
      toast.error("Please enter a valid twitter username");
      return;
    }
    //check if it starts with @ or has space
    if (twitterUsername.startsWith("@") || twitterUsername.includes(" ")) {
      toast.error("Please enter a valid twitter username");
      return;
    }

    const loadingToast = toast.loading("Searching...");
    try {
      const response = await fetch(url);
      const data = await response.json();
      const profileInfoVar = data.result[0];
      const userAddress = profileInfoVar.owner;
      //route to /address/{owner}
      window.location.href = `/address/${userAddress}`;
    } catch {
      toast.dismiss(loadingToast);
      toast.error(
        "Twitter profile not found. Make sure twitter username is correct!"
      );
    }
  }
  useEffect(() => {
    getPrice();
  }, []);
  return (
    <div>
      <Toaster />
      {loading && (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!loading && (
        <div className="">
          <a href="/" className="text-2xl font-bold text-gray-700 mx-4 my-5">
            BitcoinCityFi
          </a>
          <div className="flex justify-center items-center space-x-1 mx-1 mt-2">
            <input
              type="text"
              placeholder={`Enter twitter handle`}
              value={twitterUsername}
              onChange={(e) => setTwitterUsername(e.target.value)}
              className="bg-gray-700 hover:bg-gray-800 text-white  py-3 w-3/4 sm:w-2/5 px-3 rounded-md shadow-inner  outline-none"
            />

            <button
              className="bg-gray-700 hover:bg-gray-800 text-white  py-3  px-8 rounded-md shadow-md"
              onClick={() => {
                handleSearch();
              }}
            >
              Search
            </button>
          </div>

          <div className="my-4 flex justify-center">
            <div className="profileInfo my-4">
              <a
                className="flex justify-center items-center space-x-2"
                href={`https://twitter.com/${profileInfo.twitter_username}`}
              >
                <img
                  src={profileInfo.twitter_avatar}
                  className="rounded-full w-15 h-15 text-gray-800"
                />
                <div className="flex flex-col justify-center">
                  <p className="font-bold">{profileInfo.twitter_name}</p>
                  <p className="text-md font-semibold text-gray-700">
                    @{profileInfo.twitter_username}
                  </p>
                </div>
              </a>

              {/* <div className="sm:w-3/4 mx-auto my-4 flex flex-auto flex-wrap space-x-8 space-y-1 sm:space-y-2"> */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-4">
                <p className="">
                  <span className="font-semibold">Key Price</span>: $
                  {Math.round(parseFloat(usernameInfo.usd_price) * 100) / 100}
                </p>

                <p className="">
                  <span className="font-semibold">Key Supply</span> :{" "}
                  {Math.round(usernameInfo.total_supply_number * 10) / 10}
                </p>
                <p className="">
                  <span className="font-semibold">Joined</span>:{" "}
                  {new Date(usernameInfo.created_at).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>

                <p>
                  <span className="font-semibold">Volume</span>:{" "}
                  {Math.round(parseFloat(usernameInfo.total_volume) * 1000) /
                    1000}{" "}
                  BTC
                </p>

                <p>
                  <span className="font-semibold">Earning</span>:{" "}
                  {Math.round(parseFloat(profileInfo.earning_fee) * 10000) /
                    10000}{" "}
                  BTC{" "}
                </p>

                <p>
                  {" "}
                  <span className="font-semibold">Holders</span>:{" "}
                  {profileInfo.holders}
                </p>

                <p>
                  {" "}
                  <span className="font-semibold">Holding</span>:{" "}
                  {profileInfo.holding}
                </p>

                <p>
                  {" "}
                  <span className="font-semibold">Chat Entry</span>:{" "}
                  {profileInfo.min_holding_requirement} Key
                </p>

                <p>
                  <span className="font-semibold">Self Keys</span>:{" "}
                  {Math.round(parseFloat(profileInfo.own_keys) * 10) / 10}
                </p>
              </div>
            </div>
          </div>
          <div className="sm:w-3/4 mx-auto ">
            <Line data={chartData} />
          </div>

          {loadingPortfolio && (
            <div className="flex justify-center items-center my-3">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

 

          {!loadingPortfolio && (
            <div>
              <h1 className="text-center text-2xl font-semibold my-4">
                Portfolio
              </h1>
              <div className="flex justify-center">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 my-4">
                <p className="text-md font-semibold text-gray-700">
                  Amount Invested: ${Math.round(netPortfolio.totalInvested)}
                </p>
                <p className="text-md font-semibold text-gray-700 mx-4">
                  Current Value: ${Math.round(netPortfolio.totalCurrent)}
                </p>
                {netPortfolio.totalCurrent > netPortfolio.totalInvested && (
                  <p className="text-green-500 font-semibold">
                    Net Profit:{" "}
                    {Math.round(
                      (netPortfolio.totalCurrent / netPortfolio.totalInvested -
                        1) *
                        1000
                    ) / 10}
                    %
                  </p>
                )}
                {netPortfolio.totalCurrent < netPortfolio.totalInvested && (
                  <p className="text-red-500 font-semibold">
                    Net Loss:{" "}
                    {Math.round(
                      (netPortfolio.totalCurrent / netPortfolio.totalInvested -
                        1) *
                        1000
                    ) / 10}
                    %
                  </p>
                )}

              
              </div>
              </div>

              <div
                className=""
                style={{
                  maxWidth: "100%",
                  overflowX: "auto",
                }}
              >
                <table className=" bg-white border border-gray-300 min-w-full overflow-x-auto ">
                  <thead>
                    <tr>
                      <th className="py-2 px-2 border-b text-left">S.No.</th>
                      <th className="py-2 px-2 border-b text-left">Key</th>
                      <th className="py-2 px-2 border-b text-left">Amount</th>
                      <th className="py-2 px-2 border-b text-left">
                        Bought Price
                      </th>
                      <th className="py-2  px-2 border-b text-left">
                        Sell Price
                      </th>
                      <th className="py-2  px-2 border-b text-left">
                        Current Value
                      </th>
                      <th className="py-2 px-2 border-b text-left">PnL</th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {portfolioData.map((key, index) => (
                      <tr key={index}>
                        <td className="py-2 px-2 border-b border-gray-300">
                          <div className="flex items-center">
                            <div className="mr-2">
                              <p className="text-sm font-medium text-gray-900">
                                {index + 1}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-2  border-b border-gray-300">
                          <a
                            className="flex items-center space-x-2 my-4"
                            href={`/address/${key.user.address}`}
                          >
                            <div className="flex justify-center items-center space-x-2">
                              <img
                                src={key.user.twitter_avatar}
                                className="rounded-full w-15 h-15 text-gray-800"
                              />
                              <div className="flex flex-col justify-center">
                                <p className="font-bold">
                                  {key.user.twitter_name}
                                </p>
                                <p className="text-md font-semibold text-gray-700">
                                  {key.user.twitter_username}
                                </p>
                              </div>
                            </div>
                          </a>
                        </td>
                        <td className="py-2 px-2  border-b border-gray-300">
                          <p className="text-sm font-medium text-gray-900">
                            {Math.round(parseFloat(key.balance) * 10) / 10}
                          </p>
                        </td>
                        <td className="py-2 px-2  border-b border-gray-300">
                          <p className="text-sm font-medium text-gray-900">
                            $
                            {Math.round(parseFloat(key.usd_buy_price) * 100) /
                              100}
                          </p>
                        </td>

                        <td className="py-2 px-2  border-b border-gray-300">
                          <p className="text-sm font-medium text-gray-900">
                            ${Math.round(parseFloat(key.usd_price) * 100) / 100}
                          </p>
                        </td>

                        <td className="py-2 px-2  border-b border-gray-300">
                          <p className="text-sm font-medium text-gray-900">
                            {key.isGreen && (
                              <span className="text-green-500">
                                {" "}
                                {key.currentValue}
                              </span>
                            )}
                            {!key.isGreen && (
                              <span className="text-red-500">
                                {" "}
                                {key.currentValue}
                              </span>
                            )}
                          </p>
                        </td>

                        <td className="py-2 px-2  border-b border-gray-300">
                          <p className="text-sm font-medium text-gray-900">
                            {key.isGreen && (
                              <span className="text-green-500">
                                {" "}
                                {key.pnl}%
                              </span>
                            )}
                            {!key.isGreen && (
                              <span className="text-red-500"> {key.pnl}%</span>
                            )}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* <div className="footer text-xl my-4 flex justify-center">
            Made with ❤️ by {"   "}{" "}
            <span className="font-bold ml-1">
              <a
                href="https://twitter.com/itsaditya_xyz"
                target="_blank"
                className="text-blue-500"
              >
                Aditya Chaudhary
              </a>
            </span>
          </div> */}
        </div>
      )}
    </div>
  );
}

export default Address;
