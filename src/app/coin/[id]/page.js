"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import Navbar from "@/components/Navbar";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function CoinPage() {
  const { id } = useParams();
  const router = useRouter();
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("7");
  const [chartData, setChartData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch coin details with retry logic
        const coinRes = await fetchWithRetry(
          `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}`
        );
        
        if (!coinRes.ok) {
          throw new Error(`Coin not found (${coinRes.status})`);
        }
        
        const coinData = await coinRes.json();
        
        // Fetch chart data
        const chartRes = await fetchWithRetry(
          `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${timeRange}`
        );
        
        if (!chartRes.ok) {
          throw new Error("Chart data unavailable");
        }
        
        const chartData = await chartRes.json();
        
        // Process chart data
        const prices = chartData.prices;
        const labels = prices.map(price => 
          new Date(price[0]).toLocaleDateString()
        );
        const priceData = prices.map(price => price[1]);
        
        setChartData({
          labels,
          datasets: [{
            label: "Price (USD)",
            data: priceData,
            borderColor: "#00ff88",
            backgroundColor: "rgba(0, 255, 136, 0.1)",
            tension: 0.4,
            fill: true
          }]
        });

        setCoin(coinData);
      } catch (err) {
        if (retryCount < 3) {
          setTimeout(() => setRetryCount(prev => prev + 1), 2000);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    // Helper function with retry logic
    const fetchWithRetry = async (url, options = {}, retries = 3) => {
      try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(response.statusText);
        return response;
      } catch (err) {
        if (retries <= 0) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchWithRetry(url, options, retries - 1);
      }
    };

    fetchData();
  }, [id, timeRange, retryCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="container mx-auto py-8 text-center text-cyan-400">
          Loading {id.replace(/-/g, " ")} data...
          {retryCount > 0 && (
            <p className="text-sm text-gray-400 mt-2">
              Attempt {retryCount + 1} of 3
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="container mx-auto py-8 text-center">
          <div className="text-red-400 mb-4">
            Error loading {id.replace(/-/g, " ")}: {error}
          </div>
          <button
            onClick={() => {
              setRetryCount(0);
              setError(null);
              setLoading(true);
            }}
            className="px-4 py-2 bg-cyan-600 rounded-md mr-2"
          >
            Retry
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 rounded-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
        >
          ← Back to Dashboard
        </button>
        
        {/* Coin Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <img 
              src={coin.image?.large} 
              alt={coin.name} 
              className="w-16 h-16"
              onError={(e) => {
                e.target.src = '/crypto-placeholder.png';
              }}
            />
            <div>
              <h1 className="text-3xl font-bold">
                {coin.name} ({coin.symbol.toUpperCase()})
              </h1>
              <p className="text-gray-400">
                Rank: #{coin.market_cap_rank}
              </p>
            </div>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex gap-4 ml-auto">
            {["7", "30", "90"].map(range => (
              <button
                key={range}
                onClick={() => {
                  setTimeRange(range);
                  setRetryCount(0);
                }}
                className={`px-4 py-2 rounded ${
                  timeRange === range ? "bg-cyan-600" : "bg-gray-800"
                }`}
              >
                {range}D
              </button>
            ))}
          </div>
        </div>

        {/* Price Chart */}
        <div className="bg-gray-900 rounded-xl p-6 mb-8">
          {chartData ? (
            <div className="h-80">
              <Line 
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' },
                    tooltip: { mode: 'index', intersect: false }
                  },
                  scales: {
                    x: { grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                    y: { grid: { color: 'rgba(255, 255, 255, 0.1)' } }
                  }
                }}
              />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">
              Chart data not available
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Price Statistics */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Price Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Current Price</span>
                <span>${coin.market_data?.current_price?.usd?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Price Change (24h)</span>
                <span className={
                  coin.market_data?.price_change_percentage_24h >= 0 
                    ? "text-green-400" 
                    : "text-red-400"
                }>
                  {coin.market_data?.price_change_percentage_24h?.toFixed(2) || 'N/A'}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Market Cap</span>
                <span>${coin.market_data?.market_cap?.usd?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Market Stats */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Market Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Trading Volume (24h)</span>
                <span>${coin.market_data?.total_volume?.usd?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Circulating Supply</span>
                <span>
                  {coin.market_data?.circulating_supply?.toLocaleString() || 'N/A'} {coin.symbol.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* All-Time Stats */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">All-Time Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">All-Time High</span>
                <span>${coin.market_data?.ath?.usd?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ATH Date</span>
                <span>
                  {coin.market_data?.ath_date?.usd 
                    ? new Date(coin.market_data.ath_date.usd).toLocaleDateString() 
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">About {coin.name}</h3>
          {coin.description?.en ? (
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: coin.description.en }}
            />
          ) : (
            <p className="text-gray-400">No description available</p>
          )}
        </div>
      </div>
    </div>
  );
}