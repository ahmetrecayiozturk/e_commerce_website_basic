import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
admin: {
    disable: false,
    backendUrl: "https://ecommerce-website-7nwl.onrender.com",
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
    {
      resolve: "./src/modules/reviews",
    },
    {
      resolve: "./src/modules/store-settings",
    },
    {
      resolve: "./src/modules/return-requests",
    },
    {
      resolve: "./src/modules/support-tickets",
    },
    {
      resolve: "./src/modules/shipment-tracking",
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/payment-iyzico",
            id: "iyzico",
            options: {
              api_key: process.env.IYZICO_API_KEY,
              secret_key: process.env.IYZICO_SECRET_KEY,
              base_url: process.env.IYZICO_BASE_URL,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/smtp-notification",
            id: "smtp",
            options: {
              channels: ["email"],
              host: process.env.SMTP_HOST,
              port: Number(process.env.SMTP_PORT || 587),
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
              from: process.env.SMTP_FROM,
              secure: process.env.SMTP_SECURE === "true",
            },
          },
        ],
      },
    },
    {
      resolve: "./src/modules/customer-notification",
    },
  ],
})