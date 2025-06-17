"use client";
import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import LoginPrompt from "@/components/LoginPrompt";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const supportedCurrencies = ["usd", "inr", "eur", "gbp", "jpy"];
const coinsPerPage = 20;

// Map currency codes to their symbols
const currencySymbols = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

const MiniSparkline = ({ data }) => {
  if (!data || data.length === 0) return null;

  const sparkData = {
    labels: data.map((_, i) => i),
    datasets: [
      {
        data,
        borderColor: "lime",
        backgroundColor: "transparent",
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.3,
      },
    ],
  };

  const sparkOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    elements: {
      line: { borderJoinStyle: "round" },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  return (
    <div className="w-24 h-10">
      <Line data={sparkData} options={sparkOptions} />
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [coins, setCoins] = useState([]);
  const [currency, setCurrency] = useState("usd");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [showChartModal, setShowChartModal] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [marketCapFilter, setMarketCapFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoggedIn(!!token);
  }, []);

  useEffect(() => {
    let intervalId;
    async function fetchCoins() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${coinsPerPage}&page=${page}&sparkline=true`
        );
        if (!res.ok) {
          if (res.status === 429) {
            throw new Error("API rate limit exceeded. Please try again later.");
          }
          throw new Error(`Failed to fetch data (${res.status})`);
        }
        const data = await res.json();
        setCoins(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCoins();
    intervalId = setInterval(fetchCoins, 30000);
    return () => clearInterval(intervalId);
  }, [currency, page]);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("/api/favorites", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error();
        const json = await res.json();
        setFavoriteIds(json.favorites || []);
      } catch (e) {
        console.error(e);
      }
    }
    loadFavorites();
  }, [loggedIn]);

  const toggleFavorite = async (coinId) => {
    if (!loggedIn) {
      setLoginMessage("Please login to add coins to your favorites");
      setShowLoginPrompt(true);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ coinId }),
      });
      const data = await res.json();
      setFavoriteIds((prev) =>
        data.status === "added"
          ? [...prev, coinId]
          : prev.filter((id) => id !== coinId)
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleShowChart = async (coinId) => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency}&days=7`
      );
      const data = await res.json();
      const prices = data.prices;

      const labels = prices.map((p) => {
        const date = new Date(p[0]);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      });

      const priceData = prices.map((p) => p[1]);

      setChartData({
        labels,
        datasets: [
          {
            label: `${coinId} Price`,
            data: priceData,
            fill: false,
            borderColor: "cyan",
            tension: 0.3,
          },
        ],
      });

      setSelectedCoin(coinId);
      setShowChartModal(true);
    } catch (e) {
      console.error("Chart data fetch error", e);
    }
  };

  const handleBuy = (coinId) => {
    if (!loggedIn) {
      setLoginMessage("Please login to purchase crypto");
      setShowLoginPrompt(true);
      return;
    }
    alert(`Buy action triggered for ${coinId}`);
  };

  const filtered = coins
    .filter((c) => (!showFavoritesOnly || favoriteIds.includes(c.id)))
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.market_cap - a.market_cap)
    .filter((c, index) => {
      if (marketCapFilter === "top10") return index < 10;
      if (marketCapFilter === "top100") return index < 100;
      return true;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="container mx-auto py-8 text-center text-cyan-400">
          Loading market data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="container mx-auto py-8 text-center">
          <div className="text-red-400 mb-4">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cyan-600 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-cyan-500">Crypto Market</h1>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded shadow">
          <span>Search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coin..."
            className="bg-transparent focus:outline-none px-2"
          />
        </div>
        <div className="flex items-center gap-4">
          <select
            className="bg-gray-200 dark:bg-gray-800 p-2 rounded shadow-sm"
            value={marketCapFilter}
            onChange={(e) => {
              setPage(1);
              setMarketCapFilter(e.target.value);
            }}
          >
            <option value="all">All Market Caps</option>
            <option value="top10">Top 10</option>
            <option value="top100">Top 100</option>
          </select>
          <select
            className="bg-gray-200 dark:bg-gray-800 p-2 rounded shadow-sm"
            value={currency}
            onChange={(e) => {
              setPage(1);
              setCurrency(e.target.value);
            }}
          >
            {supportedCurrencies.map((cur) => (
              <option key={cur}>{cur.toUpperCase()}</option>
            ))}
          </select>
          <button
            onClick={() => {
              if (!loggedIn) {
                setLoginMessage("Please login to view favorites");
                setShowLoginPrompt(true);
                return;
              }
              setShowFavoritesOnly((prev) => !prev);
              setSearch("");
            }}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded shadow"
          >
            {showFavoritesOnly ? "View All" : "Favorites"}
          </button>
        </div>
      </div>

      <div className="overflow-auto rounded-lg shadow-lg">
        <table className="min-w-full table-fixed bg-gray-800 text-white rounded-lg overflow-hidden">
          <thead className="bg-gray-700 text-white text-sm uppercase tracking-wider">
            <tr>
              <th className="px-3 py-3 w-10 text-center">#</th>
              <th className="px-3 py-3 w-52 text-left">Coin</th>
              <th className="px-3 py-3 w-36 text-right">
                Price ({currency.toUpperCase()})
              </th>
              <th className="px-3 py-3 w-24 text-right">24H</th>
              <th className="px-3 py-3 w-44 text-right">Market Cap</th>
              <th className="px-3 py-3 w-32 text-center">7D</th>
              <th className="px-3 py-3 w-36 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, idx) => (
              <tr
                key={c.id}
                className="hover:bg-gray-700 transition-all duration-150 text-sm cursor-pointer group"
                onClick={() => router.push(`/coin/${c.id}`)}
              >
                <td className="text-center py-4 w-10 group-hover:bg-gray-700">
                  {(page - 1) * coinsPerPage + idx + 1}
                </td>
                <td className="flex items-center gap-3 py-4 px-2 w-52 group-hover:bg-gray-700">
                  <Link
                    href={`/coin/${c.id}`}
                    className="flex items-center gap-3 w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img src={c.image} alt={c.name} className="w-6 h-6" />
                    <div>
                      <div className="font-semibold">{c.symbol.toUpperCase()}</div>
                      <div className="text-gray-400 text-xs">{c.name}</div>
                    </div>
                  </Link>
                </td>
                <td className="text-right py-4 px-2 w-36 group-hover:bg-gray-700">
                  {currencySymbols[currency]}
                  {c.current_price.toLocaleString()}
                </td>
                <td
                  className={`text-right py-4 px-2 w-24 font-semibold group-hover:bg-gray-700 ${
                    c.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {c.price_change_percentage_24h?.toFixed(2)}%
                </td>
                <td className="text-right py-4 px-2 w-44 group-hover:bg-gray-700">
                  {currencySymbols[currency]}
                  {c.market_cap.toLocaleString()}
                </td>
                <td className="text-center py-4 px-2 w-32 group-hover:bg-gray-700">
                  <MiniSparkline data={c.sparkline_in_7d?.price} />
                </td>
                <td
                  className="text-center py-4 px-2 w-36 space-x-2 group-hover:bg-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(c.id);
                    }}
                    className="text-yellow-400 text-xl hover:scale-110 transition-transform"
                  >
                    {favoriteIds.includes(c.id) ? "★" : "☆"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowChart(c.id);
                    }}
                    className="text-blue-400 hover:text-blue-600 text-sm underline"
                  >
                    View Chart
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuy(c.id);
                    }}
                    className="text-green-400 hover:text-green-600 text-sm underline"
                  >
                    Buy
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!showFavoritesOnly && (
        <div className="flex justify-center gap-4 my-6">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
            Page {page}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
          >
            Next
          </button>
        </div>
      )}

      {showChartModal && chartData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-cyan-500">
                Price Chart - {selectedCoin}
              </h2>
              <button
                onClick={() => setShowChartModal(false)}
                className="text-red-500 hover:text-red-700 font-bold text-lg"
              >
                ×
              </button>
            </div>
            <Line data={chartData} />
          </div>
        </div>
      )}

      {showLoginPrompt && (
        <LoginPrompt
          message={loginMessage}
          onClose={() => setShowLoginPrompt(false)}
        />
      )}
    </div>
  );
}
