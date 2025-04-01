import { defineAuth } from "convex/server";
import { v } from "convex/values";

export default defineAuth({
  providers: [
    {
      domain: "https://webify-rho.vercel.app",
      applicationID: "next-auth",
    },
    {
      domain: "http://localhost:3000",
      applicationID: "next-auth",
    }
  ],
}); 