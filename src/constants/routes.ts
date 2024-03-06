
export const routes = {
  public: [
    "/",
    "/signin",
    "/signup",
    "/schedule/",
    "/company/"
  ],
  protecteds: {
    both: [],
    admin: [
      "/admin/dashboard",
      "/admin/settings",
      "/admin/calendar"
    ],
    customer: [
      "/dashboard",
      "/settings",
    ],
  }
}