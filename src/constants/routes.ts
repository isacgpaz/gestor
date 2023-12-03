
export const routes = {
  public: ["/", "/signin", "/signup"],
  protecteds: {
    admin: [
      "/admin/dashboard"
    ],
    customer: [
      "/dashboard"
    ],
  }
}