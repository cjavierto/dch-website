import path from "node:path";
import { fileURLToPath } from "node:url";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { buildConfig } from "payload";
import sharp from "sharp";
import { migrations } from "./migrations";
import { bodyEditor } from "./payload/fields";
import { Articles, NewsPosts } from "./payload/collections/Posts";
import { BookingRequests, ContactSubmissions, JobApplications, Users } from "./payload/collections/Inbox";
import { Doctors, StaffMembers } from "./payload/collections/People";
import { ApplicantFiles, Media } from "./payload/collections/Media";
import { Faqs } from "./payload/collections/Faqs";
import { JobPostings } from "./payload/collections/JobPostings";
import { Services } from "./payload/collections/Services";
import { AboutPage, CareersPage, HomepageSettings, LegalPages, PatientsPage, SiteSettings, VisionPage } from "./payload/globals";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "",
  secret: process.env.PAYLOAD_SECRET || "",
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " · DCH Admin",
      icons: [{ rel: "icon", type: "image/jpeg", url: "/images/dch-logo.jpg" }],
    },
    components: {
      graphics: {
        Logo: "@/payload/admin/Brand#Logo",
        Icon: "@/payload/admin/Brand#Icon",
      },
    },
    importMap: { baseDir: dirname },
  },
  // Order sets the sidebar: Content, Inbox, Library, Settings.
  // Booking requests stay hidden in the admin until booking launches.
  collections: [
    Services,
    NewsPosts,
    Articles,
    Doctors,
    StaffMembers,
    JobPostings,
    Faqs,
    ContactSubmissions,
    BookingRequests,
    JobApplications,
    ApplicantFiles,
    Media,
    Users,
  ],
  globals: [AboutPage, VisionPage, PatientsPage, CareersPage, SiteSettings, HomepageSettings, LegalPages],
  editor: bodyEditor,
  // SQLite: one file (data/dch.db by default), so the site runs on Namecheap
  // shared hosting without a database server. Schema changes always go
  // through migrations (also in dev), so the same file works in production:
  //   npm run payload migrate:create <name> && npm run payload migrate
  // Production applies pending migrations on startup.
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URL || "file:./data/dch.db" },
    push: false,
    migrationDir: path.resolve(dirname, "migrations"),
    prodMigrations: migrations,
  }),
  sharp,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  graphQL: { disable: true },
  // TODO(email): add an email adapter (e.g. @payloadcms/email-nodemailer) once
  // the hospital's SMTP settings exist, then send the hospital inbox / HR a
  // notice from afterChange hooks on contact-submissions and job-applications.
});
