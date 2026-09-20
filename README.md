# Shajgoj E-Commerce Platform

A high-performance modern e-commerce web application built for beauty and cosmetic products.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT & OTP verification via Brevo SMTP
- **Design & Development**: [JarzDigital.com](https://jarzdigital.com)

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and provide your credentials:
```bash
cp .env.example .env.local
```

Required environment variables:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for session encryption
- `BREVO_API_KEY`: Brevo SMTP API key
- `BREVO_SMTP_USER`: Brevo SMTP user login
- `BREVO_FROM_EMAIL`: Verified Brevo sender email

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Build for Production
```bash
npm run build
npm run start
```
