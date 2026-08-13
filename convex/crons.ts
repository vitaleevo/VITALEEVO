import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Envia o resumo semanal toda segunda-feira às 09:00 UTC (aproximadamente 10:00 em Angola)
crons.weekly(
    "weekly-newsletter-digest",
    { dayOfWeek: "monday", hourUTC: 9, minuteUTC: 0 },
    api.newsletterActions.sendWeeklyDigest
);

export default crons;
