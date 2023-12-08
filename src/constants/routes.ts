
export const routes = {
  public: ["/", "/signin", "/signup"],
  protecteds: {
    both: [
      "/company/"
    ],
    admin: [
      "/admin/dashboard",
      "/admin/settings",
    ],
    customer: [
      "/dashboard",
      "/settings",
    ],
  }
}