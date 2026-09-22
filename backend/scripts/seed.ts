import { config } from "dotenv";

config({ path: [".env.local", ".env"], quiet: true });

import { hashPassword } from "../lib/auth/password";
import { connectToDatabase, disconnectFromDatabase } from "../lib/db";
import { Project, PROJECT_STATUSES, type ProjectStatus } from "../models/Project";
import { TeamMember } from "../models/TeamMember";
import { User } from "../models/User";
import { FALLBACK_ROSTER, PROJECT_BLUEPRINTS, ROLES } from "./seed-data";

const ROSTER_URL = "https://jsonplaceholder.typicode.com/users";
const DEMO_EMAIL = process.env.SEED_USER_EMAIL ?? "demo@saasdash.dev";
const DEMO_PASSWORD = process.env.SEED_USER_PASSWORD ?? "demo12345";

type RosterEntry = { name: string; email: string };

/**
 * Deterministic PRNG (mulberry32): re-running the seed produces the same
 * dashboard, so screenshots and manual test steps stay valid.
 */
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Team members come from a public API; a bundled copy keeps seeding offline-safe. */
async function fetchRoster(): Promise<{ entries: RosterEntry[]; source: string }> {
  try {
    const response = await fetch(ROSTER_URL, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const users = (await response.json()) as { name: string; email: string }[];
    if (!Array.isArray(users) || users.length === 0) throw new Error("empty payload");

    return {
      entries: users.map((user) => ({ name: user.name, email: user.email.toLowerCase() })),
      source: ROSTER_URL,
    };
  } catch (error) {
    console.warn(`  ! ${ROSTER_URL} unavailable (${describe(error)}); using bundled roster`);
    return { entries: FALLBACK_ROSTER, source: "bundled fallback" };
  }
}

function pickStatus(random: () => number): ProjectStatus {
  const roll = random();
  if (roll < 0.5) return "active";
  if (roll < 0.7) return "on_hold";
  return "completed";
}

/**
 * Completed work sits in the past; a few active projects are deliberately
 * overdue. Deadlines land on UTC midnight because a deadline is a calendar
 * date, which also keeps a same-day re-seed byte-identical.
 */
function pickDeadline(status: ProjectStatus, random: () => number): Date {
  const [from, to] =
    status === "completed" ? [-210, -14] : status === "on_hold" ? [21, 300] : [-30, 240];

  const deadline = new Date();
  deadline.setUTCHours(0, 0, 0, 0);
  deadline.setUTCDate(deadline.getUTCDate() + Math.round(from + random() * (to - from)));
  return deadline;
}

async function seed() {
  console.log("Seeding\n");
  await connectToDatabase();

  const { entries, source } = await fetchRoster();
  console.log(`  roster source: ${source}`);

  // Upsert by email so re-seeding keeps stable ids for anything already linked.
  const members = await Promise.all(
    entries.map((entry, index) =>
      TeamMember.findOneAndUpdate(
        { email: entry.email },
        { name: entry.name, email: entry.email, role: ROLES[index % ROLES.length] },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
      ),
    ),
  );

  const random = createRandom(20260922);
  const projects = PROJECT_BLUEPRINTS.map(([name, description], index) => {
    const status = pickStatus(random);
    return {
      name,
      description,
      status,
      deadline: pickDeadline(status, random),
      assignee: members[index % members.length]._id,
      budget: Math.round((5_000 + random() * 245_000) / 500) * 500,
    };
  });

  // Projects are generated, so a full replace keeps the result reproducible.
  await Project.deleteMany({});
  await Project.insertMany(projects);

  await User.findOneAndUpdate(
    { email: DEMO_EMAIL },
    { name: "Demo User", email: DEMO_EMAIL, passwordHash: await hashPassword(DEMO_PASSWORD) },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  const byStatus = await Promise.all(
    PROJECT_STATUSES.map(async (status) => `${status}: ${await Project.countDocuments({ status })}`),
  );

  console.log(`  team members: ${members.length}`);
  console.log(`  projects:     ${projects.length} (${byStatus.join(", ")})`);
  console.log(`\nSign in with ${DEMO_EMAIL} / ${DEMO_PASSWORD}\n`);
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

seed()
  .catch((error: unknown) => {
    console.error("\nSeeding failed:", describe(error));
    process.exitCode = 1;
  })
  .finally(disconnectFromDatabase);
