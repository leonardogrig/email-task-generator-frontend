interface Email {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  body: string;
}

interface SortedEmail {
  original_email: Email;
  ai_analysis: {
    estimated_task_time: string;
    is_task: boolean;
    tags: string[];
    task_description: string;
    urgency: number;
  };
  addedToCalendar?: boolean;
}
