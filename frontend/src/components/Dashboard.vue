<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Navbar -->
    <nav class="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      <div class="flex items-center space-x-6">
        <img
          src="../assets/logo.png"
          alt="Logo"
          class="w-40 h-15 object-contain"
        />
        <!-- Nav Options next to logo -->
        <div class="flex items-center space-x-2">
          <button
            v-for="option in navOptions"
            :key="option"
            @click="selectedNav = option"
            class="px-4 py-2 font-medium text-sm rounded-md transition focus:outline-none"
            :class="selectedNav === option
              ? 'text-blue-700'
              : 'text-black hover:bg-blue-600 hover:text-white'"
          >
            {{ option }}
          </button>
        </div>
      </div>
      <!-- User Dropdown -->
      <div class="relative" @click="toggleDropdown">
        <button class="flex items-center space-x-2 focus:outline-none">
          <span class="font-medium">Admin</span>
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div
          v-if="dropdownOpen"
          class="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-10"
        >
          <ul class="py-2 text-sm text-gray-700">
            <li>
              <a
                href="#"
                class="block px-4 py-2 hover:bg-gray-100"
                @click.prevent="openResetForm"
              >
                Change Password
              </a>
            </li>
            <li>
              <a
                href="#"
                class="block px-4 py-2 hover:bg-gray-100"
                @click.prevent="logout"
              >
                Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Content Area -->
    <main class="flex-1 p-6">
      <div v-if="selectedNav === 'Performance'">
        <!-- Time Tracking Dashboard (default) -->
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-semibold">XcellenceTrackr Dashboard</h1>
          <!-- Option Selector -->
          <div class="inline-flex rounded-md shadow-sm border overflow-hidden">
            <button
              v-for="option in options"
              :key="option"
              @click="selectedOption = option"
              class="px-4 py-2 font-medium text-sm focus:outline-none transition"
              :class="
                selectedOption === option
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-r last:border-r-0'
              "
            >
              {{ option }}
            </button>
          </div>
        </div>
        <!-- Display Selected Component -->
        <div>
          <DayView v-if="selectedOption === 'Day'" />
          <p v-else-if="selectedOption === 'Week'" class="text-gray-600 text-lg">
            📅 Week view coming soon
          </p>
          <p v-else-if="selectedOption === 'Month'" class="text-gray-600 text-lg">
            📆 Month view coming soon
          </p>
          <p
            v-else-if="selectedOption === 'Quarter'"
            class="text-gray-600 text-lg"
          >
            📊 Quarter view coming soon
          </p>
        </div>
      </div>
      <div v-else-if="selectedNav === 'Attendance'">
        <!-- Attendance Dashboard (same layout as Performance) -->
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-semibold">Attendance Dashboard</h1>
          <!-- Option Selector -->
          <div class="inline-flex rounded-md shadow-sm border overflow-hidden">
            <button
              v-for="option in options"
              :key="option"
              @click="selectedOption = option"
              class="px-4 py-2 font-medium text-sm focus:outline-none transition"
              :class="
                selectedOption === option
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-r last:border-r-0'
              "
            >
              {{ option }}
            </button>
          </div>
        </div>
        <!-- Display Selected Component -->
        <div>
          <AttendanceDayView v-if="selectedOption === 'Day'" />
          <p v-else-if="selectedOption === 'Week'" class="text-gray-600 text-lg">
            📅 Week view coming soon
          </p>
          <p v-else-if="selectedOption === 'Month'" class="text-gray-600 text-lg">
            📆 Month view coming soon
          </p>
          <p
            v-else-if="selectedOption === 'Quarter'"
            class="text-gray-600 text-lg"
          >
            📊 Quarter view coming soon
          </p>
        </div>
      </div>
    </main>

    <!-- Reset Password Modal -->
    <div
      v-if="showReset"
      class="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-20"
    >
      <div class="bg-white p-6 rounded-xl w-96 shadow-lg relative">
        <h2 class="text-lg font-bold mb-4">Reset Password</h2>

        <form @submit.prevent="handleReset" class="space-y-4">
          <div>
            <label class="block text-sm mb-1">Username</label>
            <input
              v-model="resetUsername"
              type="text"
              class="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <label class="block text-sm mb-1">Old Password</label>
            <input
              v-model="oldPassword"
              type="password"
              class="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <label class="block text-sm mb-1">New Password</label>
            <input
              v-model="newPassword"
              type="password"
              class="w-full border px-3 py-2 rounded-md"
            />
          </div>

          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Reset Password
          </button>
        </form>

        <p v-if="error" class="text-red-500 mt-2 text-sm">{{ error }}</p>
        <p v-if="success" class="text-green-600 mt-2 text-sm">{{ success }}</p>

        <button
          @click="closeResetForm"
          class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import DayView from "./DayView.vue";
import AttendanceDayView from "./AttendanceDayView.vue";
import api from "../services/api"; // Import the api instance
export default {
  name: "Dashboard",
  components: { DayView, AttendanceDayView },
  data() {
    return {
      dropdownOpen: false,
      showReset: false,
      resetUsername: "",
      oldPassword: "",
      newPassword: "",
      error: "",
      success: "",
      navOptions: ["Performance", "Attendance"],
      selectedNav: "Performance",
      options: ["Day", "Week", "Month", "Quarter"],
      selectedOption: "Day", // default is Day
    };
  },
  methods: {
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    },
    logout() {
      localStorage.removeItem("auth");
      this.$router.push("/");
    },
    openResetForm() {
      this.showReset = true;
      this.dropdownOpen = false;
    },
    closeResetForm() {
      this.showReset = false;
      this.resetUsername = "";
      this.oldPassword = "";
      this.newPassword = "";
      this.error = "";
      this.success = "";
    },
    async handleReset() {
      this.error = "";
      this.success = "";
      try {
        const res = await api.post(
          "/auth/update-password",
          {
            username: this.resetUsername,
            oldPassword: this.oldPassword,
            newPassword: this.newPassword,
          }
        );

        if (res.status === 200) {
          this.success = "Password reset successfully ✅";
          setTimeout(() => {
            this.closeResetForm();
          }, 2000);
        } else {
          this.error = "Password reset failed ❌";
        }
      } catch (err) {
        console.error(err);
        this.error = "Password reset failed ❌";
      }
    },
  },
};
</script>


