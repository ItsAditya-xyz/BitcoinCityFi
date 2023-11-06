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
          <div className="flex justify-center items-center space-x-2 my-4">
            <input
              type="text"
              value={twitterUsername}
              onChange={(e) => setTwitterUsername(e.target.value)}
              placeholder="Enter Twitter Username"
              className="text-center text-gray-800 text-xl border-2 border-gray-200 rounded-md p-2 w-3/4 sm:w-1/2 outline-none"
            />

            <button
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>

          <div className="my-4 flex justify-center">
            <a
              className="profileInfo my-4"
              href={`https://twitter.com/${profileInfo.twitter_username}`}
            >
              <div className="flex justify-center items-center space-x-2">
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
              </div>
            </a>
          </div>
          <div className="w-full">
            <Line data={chartData} />
          </div>

          <div className=" my-4  mx-16 ">
            <p className="">
              Key Price: $
              {Math.round(parseFloat(usernameInfo.usd_price) * 100) / 100}
            </p>

            <p className="">
              Key Supply:{" "}
              {Math.round(usernameInfo.total_supply_number * 10) / 10}
            </p>
            <p className="">
              Joined:{" "}
              {new Date(usernameInfo.created_at).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>

            <p>
              Volume:{" "}
              {Math.round(parseFloat(usernameInfo.total_volume) * 1000) / 1000}{" "}
              BTC
            </p>

            <p>Holders: {profileInfo.holders}</p>

            <p>Holding: {profileInfo.holding}</p>

            <p>Chat Entry: {profileInfo.min_holding_requirement} Key</p>

            <p>Self Keys: {profileInfo.own_keys}</p>
          </div>

          <div className="footer text-xl my-4 flex justify-center">
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
          </div>
        </div>
      )}
    </div>
  );
}

export default Address;
