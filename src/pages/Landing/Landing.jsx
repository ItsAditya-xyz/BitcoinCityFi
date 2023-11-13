import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import { Chart } from "react-chartjs-2";

function Landing(props) {
  const [topKeys, setTopKeys] = useState([]);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [topPortfolio, setTopPortfolio] = useState([]);
  const [topPoints, setTopPoints] = useState({});
  const [currentTab, setCurrentTab] = useState("keys");

  const [pointsStats, setPointsStats] = useState({});
  const [pointsPieChart, setPointsPieChart] = useState(null);

  async function getTopKeys() {
    if (topKeys.length > 0) return;
    const url = `https://api.newbitcoincity.com/api/nbc-keys/tokens?network=nos&page=1&limit=500&key_type=1&followers=0,200000&portfolio=1&sort_col=buy_price&sort_type=0`;

    const response = await fetch(url);
    const data = await response.json();
    const topKeysVar = data.result;
    setTopKeys(topKeysVar);
    setIsLoading(false);
  }

  async function getTopPortfolios() {
    if (topPortfolio.length > 0) return;
    const url2 = `https://alpha-api.newbitcoincity.com/api/player-share/tokens?network=nos&page=1&limit=500&key_type=1&side=1&followers=0,200000&price_usd=0,1000&sort_col=portfolio&sort_type=0&address=0x26B131763413838375B4B6Adb149c59E43CD4445&holder=0&placeholder=0&price=0,1000&search=&portfolio=1`;
    const response2 = await fetch(url2);
    const data2 = await response2.json();
    const topPortfoliosVar = data2.result;
    setTopPortfolio(topPortfoliosVar);
  }

  async function getTopPoints() {
    if (Object.keys(topPoints).length > 0) return;
    const url3 = "https://itsaditya.live/api/nbc/leaderboard?limit=2000";
    const response3 = await fetch(url3);
    const data3 = await response3.json();
    const topPointsVar = data3.result;
    let totalPointsVar = 0;
    let restPoints = 0;
    //loop through topPointsVar and get total points and sum it up
    let top10Farmers = [];
    console.log(topPointsVar);
    // loop through the object topPointsVar and get the total points
    for (let i = 0; i < 500; i++) {
      totalPointsVar += parseFloat(topPointsVar[i].totalPoints);
      if (i < 10) {
        top10Farmers.push({
          name: topPointsVar[i].twitterUsername,
          points: Math.round(parseFloat(topPointsVar[i].totalPoints)),
        });
      } else {
        restPoints += parseFloat(topPointsVar[i].totalPoints);
      }
    }

    let totalPieLabels = top10Farmers.map((item) => item.name);
    let finalTotalPieLabels = [];

    let datasetData = top10Farmers.map((item) => item.points);
    console.log(datasetData)

    for(let i=0;i<totalPieLabels.length;i++){
      finalTotalPieLabels.push(`${totalPieLabels[i]} (${Math.round(datasetData[i]/totalPointsVar*1000)/10}%)`)
    }
    //loop thourhg datasetData and add % to it
    console.log(restPoints)
    datasetData.push(Math.round(restPoints));
    finalTotalPieLabels.push(`Others (${Math.round(restPoints/totalPointsVar*1000)/10}%)`);
    let dataVar = {
      labels: finalTotalPieLabels,
      datasets: [
        {
          label: "Total Points",
          data: datasetData,

          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 205, 86)",
            "#F4CE14",
            "#F8BDEB",
            "#DE8F5F",
            "#00A9FF",
            "#7743DB",
            "#D0A2F7",
            "#164863",
            "#9FBB73",
          ],
        },
      ],
    };

    setPointsPieChart(dataVar);
    setPointsStats({
      totalPoints: Math.round(totalPointsVar * 100) / 100,
    });
    setTopPoints(topPointsVar);
  }

  async function handleSearch() {
    let letFinalUsername = username;

    if (!username) {
      toast.error("Please enter a valid twitter username.");
      return;
    }
    //check if it starts with @ or has space
    if (username.includes(" ")) {
      toast.error("Username cannot have space");
      return;
    }
    if (username.startsWith("@")) {
      letFinalUsername = username.substring(1);
    }

   
    const url = `https://alpha-api.newbitcoincity.com/api/nbc-keys/tokens?network=nos&address=&page=1&limit=100&search=${letFinalUsername}`;

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
      toast.error("Twitter profile not found on NBC!");
    }
  }

  useEffect(() => {
    getTopKeys();
  }, []);
  return (
    <div>
      <Toaster />
      <div className="pt-12 sm:pt-24 bg-gradient-to-r from-blue-500  to-red-400  sm:pb-10 ">
        <div className="container px-3 mx-auto flex flex-wrap flex-col md:flex-row items-center ">
          <div className="flex flex-col w-full md:w-3/5 mx-auto justify-center items-start text-center md:text-left">
            <h1 className="my-4 text-5xl sm:text-6xl font-extrabold leading-tight text-white text-center">
              Get in Touch with Real Time Alpha Statistics.
            </h1>
            <p className="text-2xl mb-8  text-white text-center mx-auto">
              See top Alpha keys, analytics about individual keys, airdrop points and more!
            </p>
          </div>
        </div>

        <div className="delay-700 transition duration-300 ease-in-out ">
          <div className="flex justify-center flex-col   space-y-4  items-center ">
            <input
              type="text"
              placeholder={`Enter twitter handle`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-4 sm:py-4 w-3/4 sm:w-1/3 px-3 rounded-md shadow-inner  outline-none"
            />
            <button
              className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 sm:py-3 px-12 rounded-md shadow-md"
              onClick={() => {
                handleSearch();
              }}
            >
              Search!
            </button>
          </div>
        </div>

        <div className="footer text-xl mt-4 flex justify-center text-white">
          Made with ❤️ by {"   "}{" "}
          <span className="font-bold ml-1">
            <a
              href="https://twitter.com/itsaditya_xyz"
              target="_blank"
              className="text-red-200"
            >
              Aditya Chaudhary
            </a>
          </span>
        </div>

        <div className="footer text-sm py-2 sm:py-0 flex justify-center text-white">
          Join{" "}
          <span className="font-bold mx-1">
            <a
              href="https://discord.gg/wuTybbZBd5"
              target="_blank"
              className="text-blue-800"
            >
              discord
            </a>
          </span>{" "}
          to access wallet tracking and key alerts {"   "}{" "}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center my-4">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {!isLoading && (
        <div className="flex justify-center items-center my-4">
          {/* have a dropdown that has sort by Keys and sort by Portfolio */}
          <div className="flex justify-center items-center space-x-4">
            <button
              className={`outline-none px-3  py-3 ${
                currentTab === "keys" &&
                "border-b-4 px-3 border-orange-300 py-3"
              }}`}
              onClick={() => {
                setCurrentTab("keys");
                getTopKeys();
              }}
            >
              Sort by Keys
            </button>
            <button
              className={`outline-none px-3  py-3 ${
                currentTab === "portfolio" &&
                "border-b-4 px-3 border-orange-300 py-3"
              }}`}
              onClick={() => {
                setCurrentTab("portfolio");
                getTopPortfolios();
              }}
            >
              Sort by Portfolio
            </button>

            <button
              className={`outline-none px-3  py-3 ${
                currentTab === "points" &&
                "border-b-4 px-3 border-orange-300 py-3"
              }}`}
              onClick={() => {
                setCurrentTab("points");
                getTopPoints();
              }}
            >
              Sort by Points
            </button>
          </div>
        </div>
      )}
      {!isLoading && currentTab === "keys" && (
        <div>
          <div>
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
                    <th className="py-2 px-2 border-b text-left">Rank</th>
                    <th className="py-2 px-2 border-b text-left">Account</th>
                    <th className="py-2 px-2 border-b text-left">Price</th>
                    <th className="py-2  px-2 border-b text-left">Volume</th>
                    <th className="py-2 px-2 border-b text-left">Supply</th>
                    <th className="py-2 px-2 border-b text-left">
                      X Followers
                    </th>
                    <th className="py-2 px-2 border-b text-left">Last Seen</th>
                  </tr>
                </thead>
                <tbody className="">
                  {topKeys.map((key, index) => (
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
                          href={`/address/${key.owner}`}
                        >
                          <div className="flex justify-center items-center space-x-2">
                            <img
                              src={key.user_twitter_avatar}
                              className="rounded-full w-15 h-15 text-gray-800"
                            />
                            <div className="flex flex-col justify-center">
                              <p className="font-bold">
                                {key.user_twitter_name}
                              </p>
                              <p className="text-md font-semibold text-gray-700">
                                {key.user_twitter_username}
                              </p>
                            </div>
                          </div>
                        </a>
                      </td>
                      <td className="py-2 px-2  border-b border-gray-300">
                        <p className="text-sm font-medium text-gray-900">
                          ${Math.round(parseFloat(key.usd_price) * 10) / 10}
                        </p>
                      </td>
                      <td className="py-2 px-2  border-b border-gray-300">
                        <p className="text-sm font-medium text-gray-900">
                          {Math.round(parseFloat(key.total_volume) * 1000) /
                            1000}{" "}
                          BTC
                        </p>
                      </td>

                      <td className="py-2 px-2  border-b border-gray-300">
                        <p className="text-sm font-medium text-gray-900">
                          {Math.round(
                            parseFloat(key.total_supply_number) * 10
                          ) / 10}{" "}
                        </p>
                      </td>

                      <td className="py-2 px-2  border-b border-gray-300">
                        {key.twitter_followers_count}
                      </td>

                      <td className="py-2 px-2 border-b border-gray-300">
                        {new Date(key.latest_online).toLocaleString(
                          "en-US",
                          {}
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!isLoading && currentTab === "portfolio" && (
        <div>
          <div>
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
                    <th className="py-2 px-2 border-b text-left">Rank</th>
                    <th className="py-2 px-2 border-b text-left">Account</th>
                    <th className="py-2 px-2 border-b text-left">Price</th>
                    <th className="py-2  px-2 border-b text-left">Portfolio</th>
                    <th className="py-2 px-2 border-b text-left">Supply</th>
                    <th className="py-2 px-2 border-b text-left">
                      X Followers
                    </th>
                    <th className="py-2 px-2 border-b text-left">Last Seen</th>
                  </tr>
                </thead>
                <tbody className="">
                  {topPortfolio.map((key, index) => (
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
                          href={`/address/${key.owner}`}
                        >
                          <div className="flex justify-center items-center space-x-2">
                            <img
                              src={key.user_twitter_avatar}
                              className="rounded-full w-15 h-15 text-gray-800"
                            />
                            <div className="flex flex-col justify-center">
                              <p className="font-bold">
                                {key.user_twitter_name}
                              </p>
                              <p className="text-md font-semibold text-gray-700">
                                {key.user_twitter_username}
                              </p>
                            </div>
                          </div>
                        </a>
                      </td>
                      <td className="py-2 px-2  border-b border-gray-300">
                        <p className="text-sm font-medium text-gray-900">
                          ${Math.round(parseFloat(key.usd_price) * 10) / 10}
                        </p>
                      </td>
                      <td className="py-2 px-2  border-b border-gray-300">
                        <p className="text-sm font-medium text-gray-900">
                          {Math.round(key.portfolio * 1000) / 1000} BTC
                        </p>
                      </td>

                      <td className="py-2 px-2  border-b border-gray-300">
                        <p className="text-sm font-medium text-gray-900">
                          {Math.round(
                            parseFloat(key.total_supply_number) * 10
                          ) / 10}{" "}
                        </p>
                      </td>

                      <td className="py-2 px-2  border-b border-gray-300">
                        {key.twitter_followers_count}
                      </td>

                      <td className="py-2 px-2 border-b border-gray-300">
                        {new Date(key.latest_online).toLocaleString(
                          "en-US",
                          {}
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!isLoading && currentTab === "points" && (
        <div>
          {!pointsPieChart && (
            <div className="flex justify-center items-center my-4">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {pointsPieChart && (
            <div>
              <div className="my-4">
                <h2 className="text-xl font-bold text-gray-800 mx-2 text-center my-2">
                  Pie Chart for Top 10 Farmers and overall points share among
                  Top 500 Farmers
                </h2>
                <h3 className="text-md font-semibold text-gray-800 mx-2 text-center my-2">
                  Total Points: {pointsStats.totalPoints.toLocaleString()}
                </h3>
                <div className="flex justify-center items-center lg:w-1/2 w-3/4 sm:3/5 mx-auto">
                  <Doughnut data={pointsPieChart} />
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
                      <th className="py-2  px-2 border-b text-left">Rank</th>
                      <th className="py-2  px-2 border-b text-left">Account</th>
                      <th className="py-2 px-2 border-b text-left">Points</th>
                      <th className="py-2  px-2 border-b text-left">
                        Point (24h)
                      </th>

                      <th className="py-2  px-2 border-b text-left ">
                        Point from Post (24h)
                      </th>

                      <th className="py-2  px-2 border-b text-left">
                        Point from Volume (24h)
                      </th>

                      <th className="py-2  px-2 border-b text-left">
                        Point from Trade (24h)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {Object.keys(topPoints).map((key, index) => (
                      <tr key={key}>
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
                            href={`/address/${topPoints[key].address}`}
                          >
                            <div className="flex justify-center items-center space-x-2">
                              <img
                                src={topPoints[key].twitterPfp}
                                className="rounded-full w-15 h-15 text-gray-800"
                              />
                              <div className="flex flex-col justify-center">
                                <p className="font-bold">
                                  {topPoints[key].twitterName}
                                </p>
                                <p className="text-md font-semibold text-gray-700">
                                  {topPoints[key].twitterUsername}
                                </p>
                              </div>
                            </div>
                          </a>
                        </td>
                        <td className="py-2 px-2  border-b border-gray-300">
                          <p className="text-sm font-medium text-gray-900">
                            {parseFloat(
                              topPoints[key].totalPoints
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </td>
                        <td className="py-2 px-2  border-b border-gray-300">
                          <p className="text-sm font-medium text-gray-900">
                            {parseFloat(
                              topPoints[key].pointIn24H
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </td>

                        <td className="py-2 px-2  border-b border-gray-300">
                          <p className="text-sm font-medium text-gray-900">
                            {parseFloat(
                              topPoints[key].pointFromPost
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </td>

                        <td className="py-2 px-2  border-b border-gray-300">
                          <p className="text-sm font-medium text-gray-900">
                            {parseFloat(
                              topPoints[key].pointFromVol
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </td>

                        <td className="py-2 px-2  border-b border-gray-300">
                          <p className="text-sm font-medium text-gray-900">
                            {parseFloat(
                              topPoints[key].pointFromTrade
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Landing;
