<template>
  <div class="mt-6">
    <!-- Title & Date Picker Row -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold">Day Summary</h2>

      <!-- Date Picker -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1 text-right"
          >Select Date</label
        >
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
            <th class="px-6 py-3">Username</th>
            <th class="px-6 py-3">Productive Time</th>
            <th class="px-6 py-3">Idle Time</th>
            <th class="px-6 py-3">Total Time</th>
            <th class="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="text-center">
          <tr
            v-for="(item, idx) in summary"
            :key="idx"
            class="hover:bg-gray-50 odd:bg-white even:bg-gray-50 transition"
          >
            <td class="px-6 py-3 font-medium text-gray-800">
              {{ item.UserName }}
            </td>

            <!-- Pills -->
            <td class="px-6 py-3">
              <span
                class="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium"
              >
                {{ item.ProductiveTime }}
              </span>
            </td>
            <td class="px-6 py-3">
              <span
                class="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium"
              >
                {{ item.IdleTime }}
              </span>
            </td>
            <td class="px-6 py-3">
              <span
                class="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold"
              >
                {{ item.TotalTime }}
              </span>
            </td>

            <!-- Actions -->
            <td class="px-6 py-3">
              <button
                @click="
                  $router.push({
                    name: 'ReportView',
                    params: { username: item.UserName, date: selectedDate },
                  })
                "
                class="px-4 py-1 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                View Full Report
              </button>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-if="summary.length === 0">
            <td colspan="5" class="px-6 py-6 text-center text-gray-500">
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
  name: "DayView",
  data() {
    return {
      summary: [],
      selectedDate: this.formatDate(new Date()),
    };
  },
  methods: {
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    async fetchSummary() {
      try {
        const res = await api.get(
          `/summary/date/${this.selectedDate}`
        );
        this.summary = res.data || [];
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
