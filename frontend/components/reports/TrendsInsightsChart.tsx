"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Box,
  CircleDollarSign,
  Filter,
  Repeat,
  MoreVertical,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  TRENDS_DATA_BY_METRIC,
  type TrendDataPoint,
  type TrendMetricKey,
} from "@/data/reports-mock";

interface TrendsInsightsChartProps {
  scaleFactor?: number;
}

const METRIC_TABS: {
  key: TrendMetricKey;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  { key: "totalStock", label: "Total Stock Units", icon: Box },
  { key: "oos", label: "Out-of-Stock (OOS)", icon: CircleDollarSign },
  { key: "accuracy", label: "Detection Accuracy", icon: Filter },
  { key: "restockVolume", label: "Restock Volume", icon: Repeat },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: TrendDataPoint }>;
}

function TrendsTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;

  return (
    <div className="min-w-[144px] rounded-[8px] border border-[#C6C6C6]/50 bg-white px-3 py-2.5 shadow-[0_6px_20px_rgba(0,0,0,0.08)]">
      <p className="text-[11px] font-medium text-[#252525]">
        {point.auditTitle}
      </p>

      <div className="mt-2 space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[9.5px] text-[#979797]">
            {point.metricLabel}
          </span>
          <span className="text-[10.5px] font-semibold text-[#4A4A4A]">
            {point.displayValue}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-[9.5px] text-[#979797]">vs last week</span>
          <span
            className={`inline-flex items-center gap-0.5 text-[10.5px] font-semibold ${
              point.isPositive ? "text-[#1A932E]" : "text-[#DC2626]"
            }`}
          >
            {point.isPositive ? (
              <ArrowUp className="h-2.5 w-2.5" strokeWidth={2.5} />
            ) : (
              <ArrowDown className="h-2.5 w-2.5" strokeWidth={2.5} />
            )}
            {point.vsLastWeek}
          </span>
        </div>
      </div>

      <div className="my-2 h-px bg-[#8F8F8F]/20" />

      <div className="rounded-full bg-[#F0FFF0] px-2.5 py-1 text-center">
        <span className="text-[9.5px] font-medium text-[#00B103]">
          Model Match Rate: {point.matchRate}
        </span>
      </div>
    </div>
  );
}

interface CustomActiveDotProps {
  cx?: number;
  cy?: number;
}

function GlowingBlueActiveDot({ cx, cy }: CustomActiveDotProps) {
  if (typeof cx !== "number" || typeof cy !== "number") return null;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={11}
        fill="rgba(85, 122, 218, 0.22)"
      />
      <circle
        cx={cx}
        cy={cy}
        r={7}
        fill="url(#activeDotBlueGradient)"
        stroke="#FFFFFF"
        strokeWidth={2.8}
      />
    </g>
  );
}

export function TrendsInsightsChart({
  scaleFactor = 1,
}: TrendsInsightsChartProps) {
  const [activeMetric, setActiveMetric] =
    useState<TrendMetricKey>("restockVolume");
  const [showBaseline, setShowBaseline] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  const rawSeries = TRENDS_DATA_BY_METRIC[activeMetric];
  const chartData = rawSeries.map((pt) => {
    const scaledPrimary =
      activeMetric === "accuracy"
        ? pt.primary
        : Math.min(24800, Math.max(1500, Math.round(pt.primary * scaleFactor)));
    const scaledBaseline =
      activeMetric === "accuracy"
        ? pt.baseline
        : Math.min(24800, Math.max(1500, Math.round(pt.baseline * scaleFactor)));
    return {
      ...pt,
      primary: scaledPrimary,
      baseline: scaledBaseline,
      displayValue:
        activeMetric === "accuracy"
          ? pt.displayValue
          : scaledPrimary.toLocaleString("en-US"),
    };
  });

  return (
    <div className="flex h-[440px] flex-col rounded-[18px] border border-[#EFF0F6] bg-white px-[24px] pt-[22px] pb-[18px]">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-medium text-black">
          Trends &amp; Insights
        </h2>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Chart options"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#575757] hover:bg-black/[0.05] transition-colors cursor-pointer"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-[32px] z-20 w-[180px] rounded-[12px] border border-[#EFF0F6] bg-white p-1.5 shadow-[0_8px_22px_rgba(0,0,0,0.08)]">
              <button
                type="button"
                onClick={() => {
                  setShowBaseline((prev) => !prev);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-full px-3 py-2 text-left text-[12.5px] text-black/80 hover:bg-[#F7F7F7] cursor-pointer"
              >
                <span>{showBaseline ? "Hide Baseline" : "Show Baseline"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMetric("restockVolume");
                  setShowBaseline(true);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left text-[12.5px] text-black/80 hover:bg-[#F7F7F7] cursor-pointer"
              >
                <span>Reset View</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Segmented Tabs Pill Bar */}
      <div className="mt-[18px] inline-flex w-fit max-w-full flex-wrap items-center gap-[3px] rounded-full bg-[#F7F7F7] p-[4px]">
        {METRIC_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMetric === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveMetric(tab.key)}
              className={`flex items-center gap-[5px] rounded-full px-[10px] py-[5px] text-[10.5px] transition-all cursor-pointer ${
                isActive
                  ? "bg-white font-medium text-black shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                  : "bg-transparent font-normal text-[#868686] hover:text-black/80"
              }`}
            >
              <Icon className="h-[12px] w-[12px] shrink-0" strokeWidth={1.7} />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Line / Area Chart */}
      <div className="mt-[22px] flex-1 min-h-0 w-full overflow-hidden">
        <ResponsiveContainer width="100%" height="100%" debounce={180}>
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 28, left: 4, bottom: 4 }}
          >
            <defs>
              <linearGradient
                id="trendsOrangeAreaGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#EE730A" stopOpacity={0.12} />
                <stop offset="75%" stopColor="#EE730A" stopOpacity={0.01} />
                <stop offset="100%" stopColor="#EE730A" stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="activeDotBlueGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#526AD8" />
                <stop offset="100%" stopColor="#61C0E4" />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="rgba(209, 209, 209, 0.5)"
              strokeWidth={0.7}
            />

            <XAxis
              dataKey="xLabel"
              axisLine={false}
              tickLine={false}
              interval={0}
              padding={{ left: 10, right: 12 }}
              tick={{ fill: "#828282", fontSize: 11.5, fontWeight: 300 }}
              dy={10}
            />

            <YAxis
              width={48}
              domain={[0, 25000]}
              ticks={[0, 5000, 10000, 15000, 20000, 25000]}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val: number) =>
                val === 0 ? "0" : val.toLocaleString("en-US")
              }
              tick={{ fill: "#959595", fontSize: 11.5, fontWeight: 300 }}
              dx={-6}
            />

            <Tooltip
              content={<TrendsTooltip />}
              cursor={{
                stroke: "#B9B9B9",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />

            {showBaseline && (
              <Line
                type="monotone"
                dataKey="baseline"
                stroke="#EAEAEA"
                strokeWidth={1.6}
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
            )}

            <Area
              type="monotone"
              dataKey="primary"
              stroke="#F08222"
              strokeWidth={2.5}
              fill="url(#trendsOrangeAreaGradient)"
              dot={false}
              activeDot={<GlowingBlueActiveDot />}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
