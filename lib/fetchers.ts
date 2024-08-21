export async function sortEmails(emails: Email[]): Promise<SortedEmail[]> {
  console.log("GOT HERE TOO");

  console.log("backend url:", process.env.NEXT_PUBLIC_BACKEND_URL);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/analyze_emails`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emails),
    }
  );

  if (!response.ok) {
    console.log("WHAT");

    throw new Error("Failed to sort emails");
  }

  return response.json();
}
