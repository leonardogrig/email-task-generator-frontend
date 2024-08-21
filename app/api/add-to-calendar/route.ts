import { google } from "googleapis";
import { NextResponse } from "next/server";

const calendar = google.calendar({ version: "v3" });

export async function POST(request: Request) {
  const { subject, description, startTime, endTime } = await request.json();

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const startDateTime = new Date(startTime).toISOString();
    const endDateTime = new Date(endTime).toISOString();

    const event = {
      summary: subject,
      description: description,
      start: {
        dateTime: startDateTime,
        timeZone: "America/Sao_Paulo",
      },
      end: {
        dateTime: endDateTime,
        timeZone: "America/Sao_Paulo",
      },
    };

    const response = await calendar.events.insert({
      auth: auth,
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      requestBody: event,
    });

    return NextResponse.json(
      {
        message: "Event added to calendar",
        eventId: response.data.id,
        startTime: startDateTime,
        endTime: endDateTime,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error adding event to calendar:", error);
    return NextResponse.json(
      {
        message: "Failed to add event to calendar",
        error: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
