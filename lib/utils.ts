import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function decodeBase64(base64: string) {
  return Buffer.from(base64, "base64").toString("utf-8");
}

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export function extractTextFromHtml(html: string): string {
  // Remove script and style elements
  html = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Replace <br> tags with newlines
  html = html.replace(/<br\s*\/?>/gi, "\n");

  // Replace other HTML tags with spaces
  html = html.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  html = decodeHtmlEntities(html);

  // Remove extra whitespace
  html = html.replace(/\s+/g, " ").trim();

  return html;
}

export function cleanText(text: string): string {
  // Remove URLs
  text = text.replace(/https?:\/\/[^\s]+/g, "");

  // Remove email addresses
  text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "");

  // Remove extra whitespace
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

export function getBody(payload: any): string {
  let content = "";

  if (payload.mimeType === "text/plain" && payload.body?.data) {
    content = decodeBase64(payload.body.data);
  } else if (payload.mimeType === "text/html" && payload.body?.data) {
    content = extractTextFromHtml(decodeBase64(payload.body.data));
  } else if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        content = decodeBase64(part.body.data);
        break;
      } else if (part.mimeType === "text/html" && part.body?.data) {
        content = extractTextFromHtml(decodeBase64(part.body.data));
        break;
      }
    }
  }

  if (!content) {
    return "No readable content found";
  }

  return cleanText(content);
}
