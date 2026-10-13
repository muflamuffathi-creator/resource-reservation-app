import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // 1. Neon Auth (Managed Better Auth)
  auth: true,

  // 2. AI Gateway
  aiGateway: true,

  // 3. Neon Object Storage
  buckets: {
    "resource-assets": {
      access: "public_read",
    },
  },

  // 4. Neon Functions (Long-running compute close to Lakebase Postgres)
  functions: {
    reservationapi: {
      name: "Reservation Service",
      source: "src/functions/index.ts",
    },
  },
});
