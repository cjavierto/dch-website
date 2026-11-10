/**
 * Doctors (the public directory) and staff (leadership and department
 * heads) are separate collections, as the handoff requires. Rosters and
 * schedules are prototype placeholders until DCH sends the real ones.
 */
import type { ClinicSession, Doctor, StaffMember, TeamCount } from "@/lib/types";

/** The same clinic hours on several days. */
const week = (days: number[], from?: string, to?: string): ClinicSession[] => days.map((day) => ({ day, from, to }));

/** Seed shape: clinic days are derived from the schedule. */
export type DoctorSeed = Omit<Doctor, "days">;

export const doctors: DoctorSeed[] = [
  { slug: "james-deiparine", initials: "JD", photo: "/images/dr-james-deiparine.png", name: "Dr. James Deiparine", specialty: "Internal Medicine · Medical Director", group: "Internal Medicine", service: "internal-medicine", schedule: [...week([0, 3], "09:00", "12:00"), { day: 3, from: "14:00", to: "16:00" }], bookable: true },
  { slug: "ramon-deiparine", initials: "RD", photo: "/images/doctor-portrait.png", name: "Dr. Ramon L. Deiparine", specialty: "Internal Medicine · Adult Cardiology", group: "Internal Medicine", service: "internal-medicine", schedule: week([1, 4], "13:00", "17:00"), bookable: true },
  { slug: "maria-alcantara", initials: "MA", name: "Dr. Maria A. Alcantara", specialty: "OB-Gynecology", group: "OB-Gynecology", service: "ob-gynecology", schedule: week([0, 2, 5], "09:00", "12:00"), bookable: true },
  { slug: "jose-bacaltos", initials: "JB", name: "Dr. Jose B. Bacaltos", specialty: "General Surgery", group: "Surgery", service: "general-surgery", schedule: week([3], "08:00", "12:00"), bookable: true },
  { slug: "liza-canonigo", initials: "LC", name: "Dr. Liza C. Canonigo", specialty: "Pediatrics", group: "Pediatrics", service: "pediatrics", schedule: week([0, 1, 2, 3, 4], "14:00", "17:00"), bookable: true },
  { slug: "edgar-pacana", initials: "EP", name: "Dr. Edgar P. Pacaña", specialty: "Radiology", group: "Diagnostics", service: "imaging-radiology", schedule: week([0, 1, 2, 3, 4, 5], "08:00", "17:00"), bookable: true, scheduleNote: "On call" },
  { slug: "nelia-sanchez", initials: "NS", name: "Dr. Nelia S. Sanchez", specialty: "Family Medicine", group: "Family & emergency medicine", schedule: [...week([0, 1, 2, 3, 4], "08:00", "17:00"), ...week([5], "08:00", "12:00")], bookable: true },
  { slug: "arnel-gantuangco", initials: "AG", name: "Dr. Arnel M. Gantuangco", specialty: "Orthopedic Surgery", group: "Surgery", service: "general-surgery", schedule: week([2], "13:00", "16:00"), bookable: true },
  { slug: "cecilia-rosales", initials: "CR", name: "Dr. Cecilia V. Rosales", specialty: "Anesthesiology", group: "Surgery", service: "general-surgery", schedule: week([1, 3, 5]), bookable: false, scheduleNote: "By OR schedule" },
  { slug: "benjie-olmedo", initials: "BO", name: "Dr. Benjie T. Olmedo", specialty: "Emergency Medicine", group: "Family & emergency medicine", service: "emergency-medicine", schedule: week([0, 1, 2, 3, 4, 5]), bookable: false, scheduleNote: "24-hour rotation" },
];

/** Directory filter chips, in display order. */
export const doctorGroups = [
  "Internal Medicine",
  "OB-Gynecology",
  "Pediatrics",
  "Surgery",
  "Diagnostics",
  "Family & emergency medicine",
];

export const staff: StaffMember[] = [
  { group: "director", name: "Dr. James Deiparine", initials: "JD", photo: "/images/dr-james-deiparine.png", title: "Medical Director", bio: "Leads clinical services and medical staff governance." },
  { group: "leadership", name: "Ana V. Villarosa, RN, MAN", initials: "AV", title: "Chief Nurse" },
  { group: "leadership", name: "Teresita G. Lopez, CPA", initials: "TG", title: "Hospital Administrator" },
  { group: "leadership", name: "Dr. Rico M. Navarro", initials: "RM", title: "Chair, Medical Staff Committee" },
  { group: "department-head", icon: "emergency", section: "Emergency room", name: "Dr. Benjie T. Olmedo", initials: "BO", title: "ER Physician-in-Charge", bio: "Oversees triage protocols and the 24-hour resident roster." },
  { group: "department-head", icon: "vaccines", section: "Nursing service", name: "Ana V. Villarosa, RN, MAN", initials: "AV", title: "Chief Nurse", bio: "Leads ward, ER, and delivery-room nursing across three shifts." },
  { group: "department-head", icon: "labs", section: "Clinical laboratory", name: "Grace P. Enriquez, RMT", initials: "GE", title: "Chief Medical Technologist", bio: "Runs hematology, chemistry, and the 24-hour on-call bench." },
  { group: "department-head", icon: "radiology", section: "Imaging", name: "Jomar L. Tabada, RRT", initials: "JL", title: "Chief Radiologic Technologist", bio: "Schedules X-ray, ultrasound, and CT studies." },
  { group: "department-head", icon: "medication", section: "Pharmacy", name: "Luisa F. Mendoza, RPh", initials: "LM", title: "Chief Pharmacist", bio: "Manages the formulary and the on-site pharmacy until 9:00 PM." },
  { group: "department-head", icon: "receipt_long", section: "Administration", name: "Teresita G. Lopez, CPA", initials: "TG", title: "Hospital Administrator", bio: "Billing, PhilHealth claims, HMO accreditation, and HR." },
];

export const teamCounts: TeamCount[] = [
  { count: 62, role: "Nurses & nursing aides", note: "Wards, ER, OR, and the delivery room" },
  { count: 8, role: "Midwives", note: "Delivery room and prenatal clinic" },
  { count: 11, role: "Medical technologists", note: "Laboratory, 24-hour coverage" },
  { count: 6, role: "Radiologic technologists", note: "X-ray, ultrasound, and CT" },
  { count: 5, role: "Pharmacists & assistants", note: "On-site pharmacy" },
  { count: 28, role: "Support & admin staff", note: "Admitting, billing, dietary, maintenance" },
];
