import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

function Landing(props) {
  const [topKeys, setTopKeys] = useState([]);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function getTopKeys() {
    const url = `https://api.newbitcoincity.com/api/nbc-keys/tokens?network=nos&page=1&limit=200&key_type=1&followers=0,200000&sort_col=buy_price&sort_type=0`;
    const response = await fetch(url);
    const data = await response.json();
    const topKeysVar = data.result;
    setTopKeys(topKeysVar);
    setIsLoading(false);
  }

  async function handleSearch() {
    const url = `https://alpha-api.newbitcoincity.com/api/player-share/tokensv1?network=nos&page=1&limit=30&key_type=1&side=1&followers=0,200000&price_usd=0,1000&sort_col=created_at&sort_type=0&holder=0&placeholder=0&price=0,1000&search=${username}`;
    if (!username) {
      toast.error("Please enter a valid twitter username");
      return;
    }
    //check if it starts with @ or has space
    if (username.startsWith("@") || username.includes(" ")) {
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
    getTopKeys();
  }, []);
  return (
    <div>
      <Toaster />
      <div className="pt-24 sm:pt-24 bg-gradient-to-r from-blue-500  to-red-400  sm:pb-10 ">
        <div className="container px-3 mx-auto flex flex-wrap flex-col md:flex-row items-center ">
          <div className="flex flex-col w-full md:w-3/5 mx-auto justify-center items-start text-center md:text-left">
            <h1 className="my-4 text-5xl font-extrabold leading-tight text-white text-center">
              Get in Touch with Real Time NewBitcoinCity Statistics.
            </h1>
            <p className="text-2xl mb-8  text-white text-center mx-auto">
              See top 200 keys, analytics about individual keys, and more!
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
              className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-4 sm:py-5 w-3/4 sm:w-2/5 px-3 rounded-md shadow-inner  outline-none"
            />
            <button
              className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 sm:py-4 px-16 rounded-md shadow-md"
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
        <div>
          <div>
            <div className=""
            style={{
                maxWidth: "100%",
                overflowX: "auto",
            }}
            >
              <table className=" bg-white border border-gray-300 min-w-full overflow-x-auto">
                <thead>
                  <tr>
                    <th className="py-2  border-b text-left">Rank</th>
                    <th className="py-2  border-b text-left">Account</th>
                    <th className="py-2  border-b text-left">Price</th>
                    <th className="py-2  border-b text-left">Volume</th>
                    <th className="py-2  border-b text-left">X Followers</th>
                    <th className="py-2  border-b text-left">Last Seen</th>
                  </tr>
                </thead>
                <tbody className="">
                  {topKeys.map((key, index) => (
                    <tr key={index}>
                      <td className="py-2  border-b border-gray-300">
                        <div className="flex items-center">
                          <div className="mr-2">
                            <p className="text-sm font-medium text-gray-900">
                              {index + 1}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2  border-b border-gray-300">
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
                                {key.user_twitter_username}
                              </p>
                              <p className="text-md font-semibold text-gray-700">
                                {key.user_twitter_name}
                              </p>
                            </div>
                          </div>
                        </a>
                      </td>
                      <td className="py-2  border-b border-gray-300">
                        <p className="text-sm font-medium text-gray-900">
                          ${Math.round(parseFloat(key.usd_price) * 10) / 10}
                        </p>
                      </td>
                      <td className="py-2  border-b border-gray-300">
                        <p className="text-sm font-medium text-gray-900">
                          {Math.round(parseFloat(key.total_volume) * 1000) /
                            1000}{" "}
                          BTC
                        </p>
                      </td>

                      <td className="py-2  border-b border-gray-300">
                        {key.twitter_followers_count}
                      </td>

                      <td className="py-2 border-b border-gray-300">
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
    </div>
  );
}

export default Landing;
