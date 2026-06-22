"use client";

import * as d3 from "d3";
import * as React from "react";
import {
  ADMIN_PERFORMANCE_WEEKDAYS,
  type AdminWeeklyPerformancePoint,
} from "@/lib/demo-data/dashboard";

const MARGIN = { top: 12, right: 14, bottom: 34, left: 44 };

function readCssVar(el: HTMLElement, name: string, fallback: string) {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

function orderedPoints(
  data: readonly AdminWeeklyPerformancePoint[],
): AdminWeeklyPerformancePoint[] {
  const map = new Map(data.map((d) => [d.day, d]));
  return ADMIN_PERFORMANCE_WEEKDAYS.map((day) => {
    return map.get(day) ?? { day, thisWeek: 0, lastWeek: 0 };
  });
}

export function AdminDashboardPerformanceChart({
  data,
}: {
  data: readonly AdminWeeklyPerformancePoint[];
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el || data.length === 0) return;

    const render = () => {
      const series = orderedPoints(data);
      const width = Math.max(240, el.clientWidth);
      const height = 280;
      const innerW = width - MARGIN.left - MARGIN.right;
      const innerH = height - MARGIN.top - MARGIN.bottom;

      const thisColor = readCssVar(el, "--chart-1", "#2563eb");
      const lastColor = readCssVar(el, "--chart-2", "#60a5fa");
      const muted = readCssVar(el, "--muted-foreground", "#71717a");
      const border = readCssVar(el, "--border", "#e4e4e7");
      const surface = readCssVar(el, "--card", "#ffffff");

      const yMaxRaw = d3.max(series, (d) => Math.max(d.thisWeek, d.lastWeek)) ?? 1;
      const yMax = Math.max(300, Math.ceil(yMaxRaw / 50) * 50);
      const y = d3.scaleLinear().domain([0, yMax]).range([innerH, 0]);
      const yTickValues = yMax <= 300 ? [0, 100, 200, 300] : y.ticks(5);

      d3.select(el).selectAll("svg").remove();

      const svg = d3
        .select(el)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("role", "img")
        .attr(
          "aria-label",
          "Performance line chart comparing this week to last week by weekday",
        );

      const g = svg
        .append("g")
        .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

      const x = d3
        .scalePoint<AdminWeeklyPerformancePoint["day"]>()
        .domain([...ADMIN_PERFORMANCE_WEEKDAYS])
        .range([0, innerW])
        .padding(0.5);

      const grid = g.append("g").attr("class", "grid").lower();
      for (const t of yTickValues) {
        grid
          .append("line")
          .attr("x1", 0)
          .attr("x2", innerW)
          .attr("y1", y(t))
          .attr("y2", y(t))
          .attr("stroke", border)
          .attr("stroke-opacity", 0.65);
      }

      const lineLast = d3
        .line<AdminWeeklyPerformancePoint>()
        .x((d) => x(d.day) ?? 0)
        .y((d) => y(d.lastWeek))
        .curve(d3.curveMonotoneX);

      const lineThis = d3
        .line<AdminWeeklyPerformancePoint>()
        .x((d) => x(d.day) ?? 0)
        .y((d) => y(d.thisWeek))
        .curve(d3.curveMonotoneX);

      const areaLast = d3
        .area<AdminWeeklyPerformancePoint>()
        .x((d) => x(d.day) ?? 0)
        .y0(innerH)
        .y1((d) => y(d.lastWeek))
        .curve(d3.curveMonotoneX);

      const areaThis = d3
        .area<AdminWeeklyPerformancePoint>()
        .x((d) => x(d.day) ?? 0)
        .y0(innerH)
        .y1((d) => y(d.thisWeek))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(series)
        .attr("fill", lastColor)
        .attr("fill-opacity", 0.18)
        .attr("d", areaLast);

      g.append("path")
        .datum(series)
        .attr("fill", "none")
        .attr("stroke", lastColor)
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", lineLast);

      g.selectAll("circle.last")
        .data(series)
        .join("circle")
        .attr("class", "last")
        .attr("cx", (d) => x(d.day) ?? 0)
        .attr("cy", (d) => y(d.lastWeek))
        .attr("r", 4)
        .attr("fill", lastColor)
        .attr("stroke", surface)
        .attr("stroke-width", 1.5);

      g.append("path")
        .datum(series)
        .attr("fill", thisColor)
        .attr("fill-opacity", 0.16)
        .attr("d", areaThis);

      g.append("path")
        .datum(series)
        .attr("fill", "none")
        .attr("stroke", thisColor)
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", lineThis);

      g.selectAll("circle.this")
        .data(series)
        .join("circle")
        .attr("class", "this")
        .attr("cx", (d) => x(d.day) ?? 0)
        .attr("cy", (d) => y(d.thisWeek))
        .attr("r", 4)
        .attr("fill", thisColor)
        .attr("stroke", surface)
        .attr("stroke-width", 1.5);

      const yAxis = d3
        .axisLeft(y)
        .tickValues(yTickValues)
        .tickFormat((d) => `${Number(d).toFixed(0)}`);

      const yG = g.append("g").call(yAxis);
      yG.select(".domain").attr("stroke", border);
      yG.selectAll(".tick line").attr("stroke", border);
      yG.selectAll(".tick text").attr("fill", muted).attr("font-size", 11);

      const xAxis = d3.axisBottom(x).tickSizeOuter(0);
      const xG = g.append("g").attr("transform", `translate(0,${innerH})`).call(xAxis);
      xG.select(".domain").attr("stroke", border);
      xG.selectAll(".tick line").attr("stroke", border);
      xG.selectAll(".tick text").attr("fill", muted).attr("font-size", 11);
    };

    render();

    const ro = new ResizeObserver(() => render());
    ro.observe(el);

    const mo = new MutationObserver(() => render());
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      ro.disconnect();
      mo.disconnect();
      d3.select(el).selectAll("svg").remove();
    };
  }, [data]);

  return (
    <div
      ref={rootRef}
      className="h-[280px] w-full min-w-0 [&:focus-within]:outline-none"
      tabIndex={-1}
    />
  );
}
