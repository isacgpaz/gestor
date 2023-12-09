
export const routes = {
  public: ["/", "/signin", "/signup"],
  protecteds: {
    both: [
      "/company/"
    ],
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