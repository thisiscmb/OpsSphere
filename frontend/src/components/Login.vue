<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <!-- Card -->
    <div class="bg-white p-6 rounded-2xl shadow-lg w-80">
      
      <!-- Logo -->
      <div class="flex justify-center mb-4">
        <img src="../assets/logo.png" alt="Logo" class="w-50 h-20 object-contain" />
      </div>

      <!-- Title -->
      <h2 class="text-xl font-bold mb-6 text-center">
        {{ showReset ? "Reset Password" : "Login" }}
      </h2>
      
      <!-- Login Form -->
      <form v-if="!showReset" @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-600 mb-1">
            Username
          </label>
          <input v-model="username" type="text" id="username"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none" />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-600 mb-1">
            Password
          </label>
          <input v-model="password" type="password" id="password"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none" />
        </div>

        <button type="submit"
          class="w-full bg-black text-white py-2 text-sm rounded-md hover:bg-gray-800 transition">
          Login
        </button>

        <p class="text-sm text-center mt-4">
          <a href="#" class="text-blue-600 hover:underline" @click.prevent="showReset = true">
            Forgot password?
          </a>
        </p>
      </form>

      <!-- Reset Password Form -->
      <form v-else @submit.prevent="handleReset" class="space-y-4">
        <div>
          <label for="reset-username" class="block text-sm font-medium text-gray-600 mb-1">
            Username
          </label>
          <input v-model="resetUsername" type="text" id="reset-username"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none" />
        </div>

        <div>
          <label for="oldPassword" class="block text-sm font-medium text-gray-600 mb-1">
            Old Password
          </label>
          <input v-model="oldPassword" type="password" id="oldPassword"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none" />
        </div>

        <div>
          <label for="newPassword" class="block text-sm font-medium text-gray-600 mb-1">
            New Password
          </label>
          <input v-model="newPassword" type="password" id="newPassword"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none" />
        </div>

        <button type="submit"
          class="w-full bg-blue-600 text-white py-2 text-sm rounded-md hover:bg-blue-700 transition">
          Reset Password
        </button>

        <p class="text-sm text-center mt-4">
          <a href="#" class="text-gray-600 hover:underline" @click.prevent="showReset = false">
            Back to Login
          </a>
        </p>
      </form>

      <!-- Messages -->
      <p v-if="error" class="text-red-500 mt-4 text-center text-sm">{{ error }}</p>
      <p v-if="success" class="text-green-600 mt-4 text-center text-sm">{{ success }}</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import api from "../services/api";
export default {
  name: "Login",
  data() {
    return {
      username: "",
      password: "",
      error: "",
      success: "",
      showReset: false,

      resetUsername: "",
      oldPassword: "",
      newPassword: ""
    };
  },
  methods: {
    async handleLogin() {
      this.clearMessages();
      try {
        const res = await api.post("/auth/login", {
          username: this.username,
          password: this.password
        });

        if (res.data.success) {
          localStorage.setItem("auth", "true");
          this.$router.push("/dashboard");
        } else {
          this.showError(res.data.message || "Invalid credentials");
        }
      } catch (err) {
        console.error(err);
        this.showError("Server error. Please try again.");
      }
    },

    async handleReset() {
      this.clearMessages();
      try {
        const res = await api.post("/auth/update-password", {
          username: this.resetUsername,
          oldPassword: this.oldPassword,
          newPassword: this.newPassword
        });

        if (res.status === 200) {
          this.success = "Password reset successfully ✅";
          this.resetUsername = "";
          this.oldPassword = "";
          this.newPassword = "";

          // disappear message + redirect to login
          setTimeout(() => {
            this.success = "";
            this.showReset = false;
          }, 2000);
        } else {
          this.showError("Password reset failed ❌");
        }
      } catch (err) {
        console.error(err);
        this.showError("Password reset failed ❌");
      }
    },

    clearMessages() {
      this.error = "";
      this.success = "";
    },

    showError(msg) {
      this.error = msg;
      setTimeout(() => (this.error = ""), 3000);
    }
  }
};
</script>
