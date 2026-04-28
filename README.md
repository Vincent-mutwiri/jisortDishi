<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Jisort Dishi

Next.js app backed by MongoDB for app data and AWS S3 presigned uploads for user files.

## Run Locally

**Prerequisites:** Node.js, MongoDB connection string, AWS S3 bucket, Gemini API key.

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and fill in:
   `MONGODB_URI`, `MONGODB_DB`, `GEMINI_API_KEY`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `S3_BUCKET_NAME`.
3. Run the Next.js app:
   `npm run dev`

The browser UI talks to internal Next API routes. MongoDB stores users, storage units, pantry items, and recipes. AWS S3 is used only where uploads are necessary through `/api/uploads/presign`.
