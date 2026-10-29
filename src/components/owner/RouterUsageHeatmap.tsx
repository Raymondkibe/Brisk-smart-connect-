import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  Activity,
  Clock,
  Sparkles,
  Zap,
  RotateCw,
  Sliders,
  Calendar,
  Users,
  Wifi,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { RouterDevice, RouterUsageHeatmapPoint } from '../../types/index.ts';

interface RouterUsageHeatmapProps {
  routers: RouterDevice[];
  onOpenDiagnosticModal?: (routerId?: string) => void;
}

export const RouterUsageHeatmap: React.FC<RouterUsageHeatmapProps> = ({
  routers,
  onOpenDiagnosticModal,
}) => {
  const [selectedRouterId, setSelectedRouterId] = useState<string>('fleet-avg');
  const [metricMode, setMetricMode] = useState<'BANDWIDTH' | 'USERS' | 'CONGESTION'>('BANDWIDTH');
  const [heatmapData, setHeatmapData] = useState<RouterUsageHeatmapPoint[]>([]);
  const [insights, setInsights] = useState<{
    peakHourLabel: string;
    offPeakWindow: string;
    recommendedRebootTime: string;
    recommendedMaintenanceDay: string;
    schedulingTips: string[];
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredCell, setHoveredCell] = useState<RouterUsageHeatmapPoint | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const loadHeatmapData = async () => {
    setLoading(true);
    try {
      const res = await api.getRouterUsageHeatmap(selectedRouterId);
      if (res && res.points) {
        setHeatmapData(res.points);
        setInsights(res.insights);
      }
    } catch (err) {
      console.warn('Failed to load heatmap data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHeatmapData();
  }, [selectedRouterId]);

  // Render D3 SVG Heatmap
  useEffect(() => {
    if (!svgRef.current || heatmapData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = d3.range(24);

    // Dimensions
    const margin = { top: 35, right: 25, bottom: 40, left: 50 };
    const width = 840 - margin.left - margin.right;
    const height = 240 - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale (Hours: 0 to 23)
    const xScale = d3
      .scaleBand<number>()
      .range([0, width])
      .domain(hours)
      .padding(0.08);

    // Y Scale (Days: 0 to 6)
    const yScale = d3
      .scaleBand<number>()
      .range([0, height])
      .domain([0, 1, 2, 3, 4, 5, 6])
      .padding(0.1);

    // Color Scale
    // Calm dark slate/navy -> Cyan/Teal -> Indigo -> Amber/Rose for peak
    let maxVal = 100;
    if (metricMode === 'BANDWIDTH') {
      maxVal = d3.max(heatmapData, (d) => d.bandwidthMbps) || 100;
    } else if (metricMode === 'USERS') {
      maxVal = d3.max(heatmapData, (d) => d.activeUsers) || 60;
    } else {
      maxVal = 100;
    }

    const colorScale = d3
      .scaleSequential((t: number) => {
        // Multi-stage interpolator: 0 = dark slate/navy, 0.35 = cyan/teal, 0.7 = indigo/purple, 1.0 = amber/rose
        return d3.interpolateRgbBasis([
          '#0f172a',
          '#0e7490',
          '#0284c7',
          '#6366f1',
          '#a855f7',
          '#f59e0b',
          '#ef4444',
        ])(t);
      })
      .domain([0, maxVal]);

    // X Axis (Hour Labels)
    const xAxis = d3
      .axisTop(xScale)
      .tickValues([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22])
      .tickFormat((d) => `${d}:00`);

    g.append('g')
      .attr('class', 'x-axis')
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    g.select('.x-axis path').attr('stroke', '#334155');
    g.selectAll('.x-axis line').attr('stroke', '#334155');

    // Y Axis (Day Labels)
    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat((d) => days[d]);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#cbd5e1')
      .attr('font-size', '11px')
      .attr('font-weight', '600');

    g.select('.y-axis path').attr('stroke', '#334155');
    g.selectAll('.y-axis line').attr('stroke', '#334155');

    // Heatmap Cells
    g.selectAll('.cell')
      .data(heatmapData)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', (d) => xScale(d.hour) || 0)
      .attr('y', (d) => yScale(d.dayIndex) || 0)
      .attr('rx', 3.5)
      .attr('ry', 3.5)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', (d) => {
        const val = metricMode === 'BANDWIDTH' ? d.bandwidthMbps : metricMode === 'USERS' ? d.activeUsers : d.congestionScore;
        return colorScale(val);
      })
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 0.6)
      .style('cursor', 'pointer')
      .style('transition', 'transform 0.15s ease, stroke 0.15s ease')
      .on('mouseenter', function (_event, d) {
        d3.select(this)
          .attr('stroke', '#38bdf8')
          .attr('stroke-width', 2);
        setHoveredCell(d);
      })
      .on('mouseleave', function () {
        d3.select(this)
          .attr('stroke', '#1e293b')
          .attr('stroke-width', 0.6);
      });

  }, [heatmapData, metricMode]);

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-6 animate-fade-in font-sans">
      {/* HEADER & FILTER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>D3.js Network Activity Heatmap</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Peak Usage & Connection Scheduling Optimizer</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Visualizes 168 hours of weekly throughput and customer density to identify congestion bottlenecks and schedule zero-downtime maintenance windows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Router Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs">
            <Wifi className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={selectedRouterId}
              onChange={(e) => setSelectedRouterId(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="fleet-avg" className="bg-slate-900 text-white">All Fleet Routers (Aggregated)</option>
              {routers.map((r) => (
                <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                  {r.name} ({r.ipAddress})
                </option>
              ))}
            </select>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMetricMode('BANDWIDTH')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                metricMode === 'BANDWIDTH'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Traffic (Mbps)
            </button>
            <button
              onClick={() => setMetricMode('USERS')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                metricMode === 'USERS'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active Guests
            </button>
            <button
              onClick={() => setMetricMode('CONGESTION')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                metricMode === 'CONGESTION'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Congestion %
            </button>
          </div>

          <button
            onClick={loadHeatmapData}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs transition-colors"
            title="Refresh Heatmap Matrix"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* D3 SVG HEATMAP CANVAS */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-hidden shadow-inner">
        {loading ? (
          <div className="h-60 flex flex-col items-center justify-center space-y-2">
            <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400 font-mono">Synthesizing D3 usage matrix (168 hourly timeblocks)...</span>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[760px]">
              <svg ref={svgRef} className="w-full h-auto block" />
            </div>
          </div>
        )}

        {/* Dynamic Color Scale Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-slate-900 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span>Low Load (Off-Peak)</span>
            <div className="h-2.5 w-36 rounded-full bg-gradient-to-r from-slate-900 via-sky-600 via-indigo-500 to-rose-500 border border-slate-800" />
            <span className="text-rose-400 font-bold">Peak Congestion</span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Hover cell for exact throughput & QoS scheduling recommendation
          </div>
        </div>
      </div>

      {/* HOVER DETAIL INSPECTOR CARD */}
      {hoveredCell ? (
        <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-sky-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold font-mono text-xs">
                {hoveredCell.dayName} {hoveredCell.hourLabel} - {((hoveredCell.hour + 1) % 24).toString().padStart(2, '0')}:00
              </span>
              <span className="text-xs font-bold text-white">
                {hoveredCell.bandwidthMbps} Mbps Throughput
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-emerald-400 font-semibold">
                {hoveredCell.activeUsers} Active Guests
              </span>
            </div>
            <div className="text-xs text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                <strong>Scheduling Optimization:</strong> {hoveredCell.recommendation}
              </span>
            </div>
          </div>

          {onOpenDiagnosticModal && (
            <button
              onClick={() => onOpenDiagnosticModal(selectedRouterId !== 'fleet-avg' ? selectedRouterId : undefined)}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap shadow-sm"
            >
              Run Diagnostic Ping →
            </button>
          )}
        </div>
      ) : (
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-400 text-center">
          💡 Click or hover over any time block in the heatmap above to view connection scheduling tips.
        </div>
      )}

      {/* CONNECTION SCHEDULING OPTIMIZATION CARDS */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Card 1: Peak Traffic Hours */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-rose-900/40 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Peak Congestion Window</span>
            </div>
            <div className="text-sm font-black text-white">
              {insights.peakHourLabel}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Video streaming and WhatsApp voice calls dominate this period. MikroTik FQ-CoDel fair queuing recommended to prevent bufferbloat.
            </p>
          </div>

          {/* Card 2: Off-Peak Maintenance Window */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-900/40 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Optimal Maintenance Window</span>
            </div>
            <div className="text-sm font-black text-white">
              {insights.offPeakWindow}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Recommended reboot time: <strong className="text-amber-300 font-mono">{insights.recommendedRebootTime}</strong> ({insights.recommendedMaintenanceDay}).
            </p>
          </div>

          {/* Card 3: Bandwidth Scheduling Rules */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-900/40 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Automated QoS Policy</span>
            </div>
            <div className="text-sm font-black text-white">
              Dynamic Queue Shaping Active
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Burst speed multipliers enabled automatically between 11:00 PM and 06:00 AM to deliver fast downloads with zero network contention.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
