<template>
  <div id="report-content" class="p-6">
    <!-- Header with logo and title -->
    <div class="flex items-center mb-6">
      <img
        src="../assets/logo.png"
        alt="XcellenceTrackr"
        class="h-20 w-50 mr-3"
      />
    </div>
    <div class="flex justify-end mb-4">
      <button
        @click="downloadPDF"
        class="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg shadow hover:bg-cyan-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
          />
        </svg>
      </button>
    </div>

    <h1 class="text-3xl font-bold text-gray-800 text-center">
      XcellenceTrackr
    </h1>

    <!-- Username + Date -->
    <h2 class="text-xl font-semibold mb-6 mt-10">
      Report for
      <span class="text-blue-600">{{ $route.params.username }}</span>
      ({{ formattedDate || $route.params.date }})
    </h2>

    <!-- Stat Cards -->
    <div v-if="summary" class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <div class="p-4 rounded-lg shadow bg-green-50">
        <p class="text-sm text-gray-600">Productive Time</p>
        <p class="text-xl font-bold text-green-600">
          {{ summary.ProductiveTime }}
        </p>
      </div>
      <div class="p-4 rounded-lg shadow bg-red-50">
        <p class="text-sm text-gray-600">Idle Time</p>
        <p class="text-xl font-bold text-red-600">{{ summary.IdleTime }}</p>
      </div>
      <div class="p-4 rounded-lg shadow bg-blue-50">
        <p class="text-sm text-gray-600">Total Time</p>
        <p class="text-xl font-bold text-blue-600">{{ summary.TotalTime }}</p>
      </div>
      <div class="p-4 rounded-lg shadow bg-cyan-50">
        <p class="text-sm text-gray-600">Tracking Period</p>
        <p class="text-xl font-bold text-cyan-600">
          {{ formatTime(summary.TrackingStart) }} -
          {{ formatTime(summary.TrackingEnd) }}
        </p>
      </div>

      <div class="p-4 rounded-lg shadow bg-purple-50">
        <p class="text-sm text-gray-600">Number of Idle Periods</p>
        <p class="text-xl font-bold text-purple-600">
          {{ numberOfIdlePeriods }}
        </p>
      </div>
      <div class="p-4 rounded-lg shadow bg-pink-50">
        <p class="text-sm text-gray-600">Longest Idle Period</p>
        <p class="text-xl font-bold text-pink-600">
          {{ longestIdlePeriod }}
        </p>
      </div>
      <div class="p-4 rounded-lg shadow bg-indigo-50">
        <p class="text-sm text-gray-600">Productivity %</p>
        <p class="text-xl font-bold text-indigo-600">
          {{ productivityPercentage }}
        </p>
      </div>
      <div class="p-4 rounded-lg shadow bg-teal-50">
        <p class="text-sm text-gray-600">Avg Idle Period</p>
        <p class="text-xl font-bold text-teal-600">
          {{ averageIdlePeriod }}
        </p>
      </div>
    </div>

    <!-- Analysis Section -->
    <!-- Analysis Section -->
    <div v-if="summary" class="bg-white p-6 rounded-xl shadow-md mt-8">
      <h3 class="text-lg font-semibold mb-4 text-center">Analysis</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Pie Chart -->
        <div>
          <h3 class="text-md font-medium mb-2 text-center">
            Productive Time vs Idle Time
          </h3>
          <div class="h-64">
            <Pie :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <!-- Bar Chart -->
        <div>
          <h3 class="text-md font-medium mb-2 text-center">
            Timeline (Productive vs Idle)
          </h3>
          <div class="h-64">
            <!-- <Bar :data="ganttData" :options="ganttOptions" /> -->
            <!-- <Bar :data="heatmapData" :options="heatmapOptions" /> -->
            <!-- <Bar :data="idleHistogramData" :options="idleHistogramOptions" /> -->
            <Scatter :data="idleScatterData" :options="idleScatterOptions" />
          </div>
        </div>
      </div>
    </div>

    <!-- No Data -->
    <p v-else class="text-gray-500 text-center mt-8">
      No report data available.
    </p>
  </div>
</template>

<script>
import axios from "axios";
import { Pie, Bar, Scatter } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
} from "chart.js";
import "chartjs-adapter-date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement
);
import api from "../services/api";

// ChartJS.register(PointElement);
export default {
  name: "ReportView",
  components: { Pie, Bar, Scatter },
  data() {
    return {
      summary: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw;
                const h = Math.floor(value / 3600);
                const m = Math.floor((value % 3600) / 60);
                const s = value % 60;
                return `${context.label}: ${h}h ${m}m ${s}s`;
              },
            },
          },
        },
      },
      // ganttOptions: {
      //   responsive: true,
      //   maintainAspectRatio: false,
      //   indexAxis: "y",
      //   plugins: { legend: { display: false } },
      //   scales: {
      //     x: {
      //       type: "time",
      //       time: { unit: "minute" },
      //       min: null,
      //       max: null,
      //     },
      //     y: { stacked: true },
      //   },
      // },
      // heatmapOptions: {
      //   responsive: true,
      //   maintainAspectRatio: false,
      //   indexAxis: "y",
      //   plugins: {
      //     legend: { display: false },
      //     tooltip: {
      //       callbacks: {
      //         label: (ctx) => {
      //           const [start, end] = ctx.raw.x;
      //           return `${ctx.dataset.label}: ${start.toLocaleTimeString([], {
      //             hour: "2-digit",
      //             minute: "2-digit",
      //           })} - ${end.toLocaleTimeString([], {
      //             hour: "2-digit",
      //             minute: "2-digit",
      //           })}`;
      //         },
      //       },
      //     },
      //   },
      //   scales: {
      //     x: {
      //       type: "time",
      //       time: { unit: "minute" },
      //       min: null,
      //       max: null,
      //     },
      //     y: {
      //       display: false, // hide axis, just one strip
      //     },
      //   },
      // },
      // idleHistogramOptions: {
      //   responsive: true,
      //   maintainAspectRatio: false,
      //   plugins: {
      //     legend: { display: false },
      //     tooltip: {
      //       callbacks: {
      //         label: (ctx) => `${ctx.raw} idle periods`,
      //       },
      //     },
      //   },
      //   scales: {
      //     x: {
      //       title: { display: true, text: "Idle Duration (minutes)" },
      //     },
      //     y: {
      //       title: { display: true, text: "Count" },
      //       beginAtZero: true,
      //       ticks: { stepSize: 1 },
      //     },
      //   },
      // },
      idleScatterOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const d = ctx.raw;
                return `Idle: ${d.duration} min at ${d.x.toLocaleTimeString(
                  [],
                  { hour: "2-digit", minute: "2-digit" }
                )}`;
              },
            },
          },
        },
        scales: {
          x: {
            type: "time",
            time: { unit: "minute" },
            title: { display: true, text: "Time of Day" },
          },
          y: {
            display: false, // hide axis if we only want a strip of dots
          },
        },
      },
    };
  },
  computed: {
    formattedDate() {
      if (!this.summary || !this.summary.Date) return "";
      return new Date(this.summary.Date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },

    // ------- PIE DATA -------
    chartData() {
      if (!this.summary) return { labels: [], datasets: [] };
      return {
        labels: ["Productive", "Idle"],
        datasets: [
          {
            data: [
              this.toSeconds(this.summary.ProductiveTime),
              this.toSeconds(this.summary.IdleTime),
            ],
            backgroundColor: ["#34d399", "#f87171"],
          },
        ],
      };
    },

    // ------- GANTT DATA -------
    // ganttData() {
    //   if (!this.summary) return { labels: [], datasets: [] };

    //   const start = new Date(this.summary.TrackingStart);
    //   const end = new Date(this.summary.TrackingEnd);

    //   const idleBlocks = this.getIdlePeriodsArray(start).map(
    //     ({ start: s, end: e }) => ({
    //       x: [s, e],
    //       y: "Idle",
    //     })
    //   );

    //   // Build productive blocks from gaps
    //   const blocksSorted = [...idleBlocks].sort((a, b) => a.x[0] - b.x[0]);
    //   const productiveBlocks = [];
    //   let cursor = start;

    //   for (const block of blocksSorted) {
    //     if (cursor < block.x[0]) {
    //       productiveBlocks.push({ x: [cursor, block.x[0]], y: "Productive" });
    //     }
    //     cursor = block.x[1];
    //   }
    //   if (cursor < end)
    //     productiveBlocks.push({ x: [cursor, end], y: "Productive" });

    //   // set x-axis bounds
    //   this.ganttOptions.scales.x.min = start;
    //   this.ganttOptions.scales.x.max = end;

    //   return {
    //     datasets: [
    //       {
    //         label: "Productive",
    //         data: productiveBlocks,
    //         backgroundColor: "#34d399",
    //         borderSkipped: false,
    //         barPercentage: 0.8,
    //       },
    //       {
    //         label: "Idle",
    //         data: idleBlocks,
    //         backgroundColor: "#f87171",
    //         borderSkipped: false,
    //         barPercentage: 0.8,
    //       },
    //     ],
    //   };
    // },
    // heatmapData() {
    //   if (!this.summary) return { datasets: [] };

    //   const start = new Date(this.summary.TrackingStart);
    //   const end = new Date(this.summary.TrackingEnd);

    //   // Get idle periods
    //   const idleBlocks = this.getIdlePeriodsArray(start).map(
    //     ({ start: s, end: e }) => ({
    //       x: [s, e],
    //       y: "Timeline",
    //     })
    //   );

    //   // Compute productive blocks from gaps
    //   const blocksSorted = [...idleBlocks].sort((a, b) => a.x[0] - b.x[0]);
    //   const productiveBlocks = [];
    //   let cursor = start;
    //   for (const block of blocksSorted) {
    //     if (cursor < block.x[0]) {
    //       productiveBlocks.push({ x: [cursor, block.x[0]], y: "Timeline" });
    //     }
    //     cursor = block.x[1];
    //   }
    //   if (cursor < end)
    //     productiveBlocks.push({ x: [cursor, end], y: "Timeline" });

    //   // set bounds
    //   this.heatmapOptions.scales.x.min = start;
    //   this.heatmapOptions.scales.x.max = end;

    //   return {
    //     datasets: [
    //       {
    //         label: "Productive",
    //         data: productiveBlocks,
    //         backgroundColor: "#34d399",
    //         borderSkipped: false,
    //         barPercentage: 1.0,
    //         categoryPercentage: 1.0,
    //       },
    //       {
    //         label: "Idle",
    //         data: idleBlocks,
    //         backgroundColor: "#f87171",
    //         borderSkipped: false,
    //         barPercentage: 1.0,
    //         categoryPercentage: 1.0,
    //       },
    //     ],
    //   };
    // },
    // idleHistogramData() {
    //   if (!this.summary?.IdlePeriods) return { labels: [], datasets: [] };

    //   // Convert idle periods to durations in minutes
    //   const durations = this.summary.IdlePeriods.split(";")
    //     .map((p) => p.trim())
    //     .filter(Boolean)
    //     .map((p) => {
    //       const [s, e] = p.split("-");
    //       if (!s || !e) return 0;
    //       const [sh, sm, ss = 0] = s.split(":").map(Number);
    //       const [eh, em, es = 0] = e.split(":").map(Number);
    //       let start = sh * 3600 + sm * 60 + ss;
    //       let end = eh * 3600 + em * 60 + es;
    //       let dur = end - start;
    //       if (dur < 0) dur += 24 * 3600;
    //       return Math.floor(dur / 60); // convert to minutes
    //     });

    //   // Define bins (0–5, 5–15, 15–30, 30+)
    //   const bins = { "0–5": 0, "5–15": 0, "15–30": 0, "30+": 0 };
    //   for (const d of durations) {
    //     if (d <= 5) bins["0–5"]++;
    //     else if (d <= 15) bins["5–15"]++;
    //     else if (d <= 30) bins["15–30"]++;
    //     else bins["30+"]++;
    //   }

    //   return {
    //     labels: Object.keys(bins),
    //     datasets: [
    //       {
    //         label: "Idle Periods",
    //         data: Object.values(bins),
    //         backgroundColor: "#f87171",
    //         borderRadius: 6,
    //         barPercentage: 0.7,
    //       },
    //     ],
    //   };
    // },
    idleScatterData() {
      if (!this.summary?.IdlePeriods) return { datasets: [] };

      const start = new Date(this.summary.TrackingStart);
      const points = [];

      this.summary.IdlePeriods.split(";")
        .map((p) => p.trim())
        .filter(Boolean)
        .forEach((p) => {
          const [s, e] = p.split("-");
          if (!s || !e) return;
          const [sh, sm] = s.split(":").map(Number);
          const [eh, em] = e.split(":").map(Number);

          const sDate = new Date(start);
          sDate.setHours(sh, sm, 0, 0);

          const eDate = new Date(start);
          eDate.setHours(eh, em, 0, 0);
          if (eDate < sDate) eDate.setDate(eDate.getDate() + 1);

          const durationMin = Math.round((eDate - sDate) / 60000);

          points.push({ x: sDate, y: 1, duration: durationMin });
        });

      return {
        datasets: [
          {
            label: "Idle Times",
            data: points,
            pointBackgroundColor: "#f87171",
            pointRadius: 6,
          },
        ],
      };
    },

    // ------- NEW CARDS -------
    numberOfIdlePeriods() {
      if (!this.summary?.IdlePeriods) return 0;
      return this.summary.IdlePeriods.split(";")
        .map((p) => p.trim())
        .filter(Boolean).length;
    },

    longestIdlePeriod() {
      if (!this.summary?.IdlePeriods) return "—";
      const periods = this.summary.IdlePeriods.split(";")
        .map((p) => p.trim())
        .filter(Boolean);
      if (periods.length === 0) return "—";
      let maxSeconds = 0;
      for (const p of periods) {
        const [s, e] = p.split("-");
        if (!s || !e) continue;
        const [sh, sm, ss = 0] = s.split(":").map(Number);
        const [eh, em, es = 0] = e.split(":").map(Number);
        let start = sh * 3600 + sm * 60 + Number(ss);
        let end = eh * 3600 + em * 60 + Number(es);
        let dur = end - start;
        if (dur < 0) dur += 24 * 3600;
        if (dur > maxSeconds) maxSeconds = dur;
      }
      if (maxSeconds <= 0) return "—";
      return this.formatDuration(maxSeconds);
    },

    productivityPercentage() {
      if (!this.summary) return "—";
      const productive = this.toSeconds(this.summary.ProductiveTime);
      const total = this.toSeconds(this.summary.TotalTime);
      if (!total) return "—";
      return ((productive / total) * 100).toFixed(1) + "%";
    },
    averageIdlePeriod() {
      if (!this.summary?.IdlePeriods) return "—";
      const periods = this.summary.IdlePeriods.split(";")
        .map((p) => p.trim())
        .filter(Boolean);
      if (periods.length === 0) return "—";
      let totalSeconds = 0;
      for (const p of periods) {
        const [s, e] = p.split("-");
        if (!s || !e) continue;
        const [sh, sm, ss = 0] = s.split(":").map(Number);
        const [eh, em, es = 0] = e.split(":").map(Number);
        let start = sh * 3600 + sm * 60 + Number(ss);
        let end = eh * 3600 + em * 60 + Number(es);
        let dur = end - start;
        if (dur < 0) dur += 24 * 3600;
        totalSeconds += dur;
      }
      const avg = totalSeconds / periods.length;
      return this.formatDuration(avg);
    },
  },
  methods: {
    formatTime(iso) {
      if (!iso) return "—";
      const d = new Date(iso);
      return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      });
    },
    formatDuration(seconds) {
      const h = Math.floor(seconds / 3600)
        .toString()
        .padStart(2, "0");
      const m = Math.floor((seconds % 3600) / 60)
        .toString()
        .padStart(2, "0");
      const s = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");
      return `${h}:${m}:${s}`;
    },
    toSeconds(hms) {
      if (!hms) return 0;
      const [h, m, s] = hms.split(":").map(Number);
      return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
    },
    getIdlePeriodsArray(dayAnchor) {
      // dayAnchor = Date from TrackingStart to anchor hours/minutes correctly
      if (!this.summary?.IdlePeriods) return [];
      return this.summary.IdlePeriods.split(";")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => {
          const [s, e] = p.split("-");
          const [sh, sm] = s.split(":").map(Number);
          const [eh, em] = e.split(":").map(Number);
          const start = new Date(dayAnchor);
          start.setHours(sh, sm, 0, 0);
          const end = new Date(dayAnchor);
          end.setHours(eh, em, 0, 0);
          // handle wrap past midnight just in case
          if (end < start) end.setDate(end.getDate() + 1);
          return { start, end };
        });
    },
    async fetchSummary() {
      try {
        const { username, date } = this.$route.params;
        const res = await api.get(
          `/summary/user/${username}?date=${date}`
        );
        this.summary =
          Array.isArray(res.data) && res.data.length ? res.data[0] : null;
      } catch (err) {
        console.error("Error fetching summary:", err);
        this.summary = null;
      }
    },
    async downloadPDF() {
      const report = document.getElementById("report-content");
      if (!report) return;

      // Hide download button
      const downloadBtn = report.querySelector("button");
      if (downloadBtn) downloadBtn.style.display = "none";

      // Wait for DOM update
      await this.$nextTick();

      const canvas = await html2canvas(report, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      // Restore button
      if (downloadBtn) downloadBtn.style.display = "";

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 0;
      if (imgHeight > pageHeight) {
        // handle multi-page
        let heightLeft = imgHeight;
        let y = 0;

        while (heightLeft > 0) {
          pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          if (heightLeft > 0) {
            pdf.addPage();
            y = heightLeft - imgHeight;
          }
        }
      } else {
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      }

      // Custom filename
      const { username, date } = this.$route.params;
      pdf.save(`Report_${username}_${date}.pdf`);
    },
  },
  created() {
    this.fetchSummary();
  },
};
</script>
