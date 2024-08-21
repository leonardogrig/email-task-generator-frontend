# Email Task Generator

This Next.js application allows users to sign in and view their last 24 hours of emails structured as tasks. Users can then send these tasks to their Google Calendar.

## Features

- User authentication with Google (NextAuth)
- Fetches recent emails and converts them to tasks
- Sends tasks to Google Calendar
- Responsive UI using Tailwind CSS and shadcn/ui components

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- NextAuth for authentication
- Google APIs (Gmail, Calendar)
- Axios for API requests
- Bun as the JavaScript runtime

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   bun install
   ```
3. Set up environment variables (see below)
4. Run the development server:
   ```
   bun run dev
   ```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CLIENT_EMAIL=your_google_client_email
GOOGLE_PRIVATE_KEY=your_google_private_key
GOOGLE_CALENDAR_ID=your_google_calendar_id
NEXTAUTH_SECRET=a_random_string
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### Obtaining Google API Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API and Google Calendar API for your project
4. Go to "Credentials" and create a new OAuth 2.0 Client ID
5. Download the client configuration and use the values for `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
6. For `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY`, create a service account and download the JSON key

Note: `GOOGLE_CALENDAR_ID` is typically your Gmail address for your primary calendar.

## Important Notes

- The `NEXT_PUBLIC_BACKEND_URL` should point to your Python backend application that converts emails to tasks.
- The `NEXTAUTH_SECRET` can be any random string, but should be kept secret in production.
- Users may need to re-authenticate with Google periodically to avoid "unauthorized" errors when creating tasks.

## Development

- Run `bun run dev` to start the development server
- Run `bun run build` to create a production build
- Run `bun run start` to start the production server
- Run `bun run lint` to lint the codebase

## License

[MIT License](LICENSE)
