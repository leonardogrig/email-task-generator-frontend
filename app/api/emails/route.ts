import {
  decodeHtmlEntities,
  getBody
} from "@/lib/utils";
import { google } from "googleapis";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session.accessToken });

  const gmail = google.gmail({ version: "v1", auth });

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      q: `after:${Math.floor(yesterday.getTime() / 1000)}`,
    });

    const emails = await Promise.all(
      response.data.messages?.map(async (message) => {
        const fullMessage = await gmail.users.messages.get({
          userId: "me",
          id: message.id!,
          format: "full",
        });

        const subject = fullMessage.data.payload?.headers?.find(
          (header) => header.name === "Subject"
        )?.value;

        const from = fullMessage.data.payload?.headers?.find(
          (header) => header.name === "From"
        )?.value;

        const body = getBody(fullMessage.data.payload);

        return {
          id: message.id,
          subject,
          from,
          date:
            fullMessage.data.payload?.headers?.find(
              (header) => header.name === "Date"
            )?.value || "",
          snippet: decodeHtmlEntities(fullMessage.data.snippet || ""),
          body: body,
        };
      }) || []
    );

    return NextResponse.json(emails);
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Error fetching emails" },
      { status: 500 }
    );
  }
}
