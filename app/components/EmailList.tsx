"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { sortEmails } from "@/lib/fetchers";
import { Calendar, Loader2 } from "lucide-react";
import { useState } from "react";

export default function EmailList() {
  const [sortedEmails, setSortedEmails] = useState<SortedEmail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSorting, setIsSorting] = useState(false);
  const [showAllEmails, setShowAllEmails] = useState(false);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState<{
    [key: string]: boolean;
  }>({});

  const fetchEmails = async () => {
    setError(null);
    try {
      const response = await fetch("/api/emails");
      if (!response.ok) {
        throw new Error("Failed to fetch emails");
      }
      const data = await response.json();
      console.log(data);

      return data;
    } catch (err) {
      console.error("Error fetching emails:", err);
      setError("Failed to fetch emails. Please try again later.");
    }
  };

  const handleSortEmails = async () => {
    setIsSorting(true);
    setError(null);

    console.log("GOT HERE");
    
    const emails = await fetchEmails();
    try {
      console.log("GOT HERE1");

      const sorted = await sortEmails(emails);

      console.log("GOT HERE 2");
      
      setSortedEmails(sorted);
    } catch (err) {
      console.error("Error sorting emails:", err);
      setError("Failed to sort emails. Please try again later.");
    } finally {
      setIsSorting(false);
    }
  };

  const handleAddToCalendar = async (email: SortedEmail) => {
    setIsAddingToCalendar((prev) => ({
      ...prev,
      [email.original_email.id]: true,
    }));
    setError(null);

    try {
      const startTime = new Date();
      startTime.setDate(startTime.getDate() + 1);
      startTime.setHours(10, 0, 0, 0);

      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

      const response = await fetch("/api/add-to-calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: email.original_email.subject,
          description: email.ai_analysis.task_description,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add event to calendar");
      }

      const result = await response.json();
      console.log("Event added to calendar:", result);

      setSortedEmails((prevEmails) =>
        prevEmails.map((prevEmail) =>
          prevEmail.original_email.id === email.original_email.id
            ? { ...prevEmail, addedToCalendar: true }
            : prevEmail
        )
      );
    } catch (err) {
      console.error("Error adding event to calendar:", err);
      setError("Failed to add event to calendar. Please try again later.");
    } finally {
      setIsAddingToCalendar((prev) => ({
        ...prev,
        [email.original_email.id]: false,
      }));
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="w-full relative">
        <CardHeader>
          <CardTitle>Email Task Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Button onClick={handleSortEmails} disabled={isSorting}>
              {isSorting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Build Tasks (24h)"
              )}
            </Button>
          </div>

          {error && (
            <Card className="bg-red-100 border-red-300">
              <CardContent className="text-red-700 p-4">{error}</CardContent>
            </Card>
          )}

          {sortedEmails.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-end space-x-2 sm:-mt-10">
                <Switch
                  checked={showAllEmails}
                  onCheckedChange={setShowAllEmails}
                />
                <span>Show all emails</span>
              </div>
              <ScrollArea className="h-[400px] pt-10">
                {sortedEmails
                  .filter((email) => showAllEmails || email.ai_analysis.is_task)
                  .map((email) => (
                    <Card key={email.original_email.id} className="mb-4">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold">
                              {email.original_email.subject}
                            </h3>
                            <p className="text-sm text-gray-500">
                              From: {email.original_email.from}
                            </p>
                            <p className="text-sm text-gray-500">
                              Date: {email.original_email.date}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCalendar(email)}
                            disabled={
                              !email.ai_analysis.is_task ||
                              email.addedToCalendar ||
                              isAddingToCalendar[email.original_email.id]
                            }
                          >
                            {isAddingToCalendar[email.original_email.id] ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Calendar className="mr-2 h-4 w-4" />
                            )}
                            {email.addedToCalendar
                              ? "Added to Calendar"
                              : "Send to Calendar"}
                          </Button>
                        </div>
                        <div className="mt-2 flex flex-col gap-2">
                          <p>
                            <strong>Task Description:</strong>{" "}
                            {email.ai_analysis.task_description || "N/A"}
                          </p>
                          <p>
                            <strong>Urgency:</strong>{" "}
                            {email.ai_analysis.urgency}/5
                          </p>
                          <p>
                            <strong>Estimated Task Time:</strong>{" "}
                            {email.ai_analysis.estimated_task_time}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {email.ai_analysis.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
