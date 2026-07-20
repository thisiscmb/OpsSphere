import { createRouter, createWebHistory } from "vue-router";
import Login from "../components/Login.vue";
import Dashboard from "../components/Dashboard.vue";
import ReportView from "../components/ReportView.vue";

const routes = [
  {
    path: "/",
    name: "Login",
    component: Login,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true }, // mark as protected
  },
  {
  path: "/report/:username/:date",
  name: "ReportView",
  component: ReportView,
  meta: { requiresAuth: true }
}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem("auth"); // check auth
  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/"); // redirect to login if not logged in
  } else {
    next(); // proceed
  }
});

export default router;
