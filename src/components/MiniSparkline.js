"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import dynamic from "next/dynamic";

const MiniSparkline = dynamic(() => import("@/components/MiniSparkline"), { ssr: false });

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function MiniSparkline({ data }) {
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
}
