<template>
  <div class="mt-6">
    <!-- Title & Date Picker Row -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold">Day Summary</h2>

      <!-- Date Picker -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1 text-right">
          Select Date
        </label>
        <input
          type="date"
          v-model="selectedDate"
          @change="fetchSummary"
          class="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    <!-- Full Width Table -->
    <div class="overflow-x-auto rounded-lg shadow-sm w-full">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-100 text-gray-600 font-medium text-center">
            <th class="px-2 py-3"></th> <!-- arrow column -->
            <th class="px-6 py-3">Username</th>
            <th class="px-6 py-3">Log In</th>
            <th class="px-6 py-3">Log Out</th>
            <th class="px-6 py-3">Total Time</th>
            <th class="px-6 py-3">Location(s)</th>
          </tr>
        </thead>
        <tbody class="text-center">
          <template v-for="(item, idx) in summary" :key="idx">
            <!-- Main Row -->
            <tr class="hover:bg-gray-50 odd:bg-white even:bg-gray-50 transition">
              <!-- Arrow -->
              <td class="px-2 py-3">
                <button
                  v-if="item.Segments && item.Segments.length > 1"
                  @click="toggleExpand(item._id || idx)"
                  class="focus:outline-none"
                >
                  <svg
                    :class="isExpanded(item._id || idx) ? 'rotate-90' : ''"
                    class="w-4 h-4 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </td>

              <!-- Username -->
              <td class="px-6 py-3 font-medium text-gray-800 text-center">
                {{ item.UserName }}
              </td>

              <!-- Log In -->
              <td class="px-6 py-3">
                <span
                  class="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium"
                >
                  {{ item.FirstLogIn ? formatTime(item.FirstLogIn) : "—" }}
                </span>
              </td>

              <!-- Log Out -->
              <td class="px-6 py-3">
                <span
                  class="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium"
                >
                  {{ item.LatestLogOut ? formatTime(item.LatestLogOut) : "—" }}
                </span>
              </td>

              <!-- Total Time -->
              <td class="px-6 py-3">
                <span
                  class="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold"
                >
                  {{ item.TotalTime }}
                </span>
              </td>

              <!-- Location -->
              <td class="px-6 py-3 text-gray-800">
                <span v-if="item.Segments && item.Segments.length > 1">
                  Multiple locations
                </span>
                <span v-else>
                  {{ item.Segments && item.Segments.length ? item.Segments[0].Location : "—" }}
                </span>
              </td>
            </tr>

            <!-- Expanded Segments -->
            <tr
              v-for="(seg, sIdx) in item.Segments"
              v-if="isExpanded(item._id || idx)"
              :key="`${idx}-seg-${sIdx}`"
              class="hover:bg-gray-50 odd:bg-white even:bg-gray-50 transition text-sm text-gray-700"
            >
              <!-- Empty arrow column for alignment -->
              <td class="px-2 py-3"></td>

              <!-- Session Name -->
              <td class="px-6 py-3 text-center italic text-gray-600">
                Session {{ sIdx + 1 }}
              </td>

              <!-- Log In -->
              <td class="px-6 py-3">
                <span class="px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                  {{ seg.LogIn ? formatTime(seg.LogIn) : "—" }}
                </span>
              </td>

              <!-- Log Out -->
              <td class="px-6 py-3">
                <span class="px-2 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium">
                  {{ seg.LogOut ? formatTime(seg.LogOut) : "—" }}
                </span>
              </td>

              <!-- Total Time -->
              <td class="px-6 py-3">
                <span class="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                  {{ seg.Duration }}
                </span>
              </td>

              <!-- Location -->
              <td class="px-6 py-3 text-center">
                {{ seg.Location || "—" }}
              </td>
            </tr>
          </template>

          <!-- Empty State -->
          <tr v-if="summary.length === 0">
            <td colspan="6" class="px-6 py-6 text-center text-gray-500">
              No records found for this day.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>


<script>
import axios from "axios";
import api from "../services/api";

export default {
  name: "AttendanceDayView",
  data() {
    return {
      summary: [],
      selectedDate: this.formatDate(new Date()),
      expandedRows: new Set(),
    };
  },
  methods: {
    toggleExpand(userId) {
      if (this.expandedRows.has(userId)) {
        this.expandedRows.delete(userId);
      } else {
        this.expandedRows.add(userId);
      }
    },
    isExpanded(userId) {
      return this.expandedRows.has(userId);
    },
    formatTime(dt) {
      if (!dt) return "—";
      const d = new Date(dt);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    },
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    formatDuration(ms) {
      // null/undefined/negative => missing
      if (ms == null || ms < 0) return "—";
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const pad = (n) => String(n).padStart(2, "0");
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    },
    async fetchSummary() {
      try {
        const res = await api.get(
          `/attendance/date/${this.selectedDate}`
        );

        const raw = res.data || [];

        // Transform each record to include per-segment Duration + TotalTime
        this.summary = raw.map((user) => {
          const origSegments = user.Segments || [];

          // create segments with duration fields
          const segments = origSegments.map((seg) => {
            const start = seg.LogIn ? new Date(seg.LogIn) : null;
            const end = seg.LogOut ? new Date(seg.LogOut) : null;
            const durationMs =
              start && end ? Math.max(0, end.getTime() - start.getTime()) : null;
            return {
              ...seg,
              DurationMs: durationMs,
              Duration: this.formatDuration(durationMs),
            };
          });

          const logins = segments
            .map((s) => s.LogIn)
            .filter(Boolean)
            .map((dt) => new Date(dt))
            .sort((a, b) => a - b);

          const logouts = segments
            .map((s) => s.LogOut)
            .filter(Boolean)
            .map((dt) => new Date(dt))
            .sort((a, b) => a - b);

          // Calculate total time in milliseconds (sum only actual durations)
          const totalMs = segments.reduce((sum, seg) => {
            return sum + (seg.DurationMs || 0);
          }, 0);

          return {
            ...user,
            Segments: segments,
            FirstLogIn: logins.length ? logins[0] : null,
            LatestLogOut: logouts.length ? logouts[logouts.length - 1] : null,
            TotalTimeMs: totalMs,
            TotalTime: this.formatDuration(totalMs),
          };
        });
      } catch (err) {
        console.error("Error fetching day summary:", err);
        this.summary = [];
      }
    },
  },
  mounted() {
    this.fetchSummary();
  },
};
</script>
