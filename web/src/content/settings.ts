/**
 * Site settings, homepage settings and FAQs — from the approved prototype.
 * Phone numbers, accreditation number and address are placeholders still to
 * be confirmed by the hospital. `{emergencyNumber}` and `{trunkline}` in any
 * seed text are filled from these settings by src/lib/cms.ts.
 */
import type { Faq, HomepageSettings, SiteSettings } from "@/lib/types";

// Footer logos are added by the seed script (src/payload/starterData.ts).
export const siteSettings: Omit<SiteSettings, "accreditationBadges" | "mapEmbedUrl" | "clinicClosures"> = {
  hospitalName: "Deiparine Community Hospital",
  shortName: "DCH",
  tagline: "Sibonga, Cebu · Since 1974",
  summary:
    "A DOH-licensed, PhilHealth-accredited community hospital serving Sibonga and southern Cebu.",
  address: {
    street: "National Highway",
    barangay: "Poblacion",
    town: "Sibonga",
    postcode: "6020",
    province: "Cebu",
  },
  emergencyNumber: "(032) 484 1234",
  trunkline: "(032) 484 1200",
  email: "info@dch-sibonga.ph",
  careersEmail: "hr@dch-sibonga.ph",
  outpatientHours: "Mon–Sat, 8:00 AM – 5:00 PM",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Deiparine+Community+Hospital+Sibonga+Cebu",
  visitingHours: [
    { area: "General wards", hours: "10 AM – 8 PM" },
    { area: "Maternity", hours: "1 PM – 7 PM" },
    { area: "ICU", hours: "4 PM – 6 PM" },
  ],
  visitingRules: "One watcher per patient. Children under 7 are not permitted in patient rooms.",
  social: {
    facebook: "",
    messenger: "",
  },
  accreditation: {
    philhealthNumber: "",
    dohLicenceLevel: "Level 1",
  },
  footerText: "© 2026 Deiparine Community Hospital",
};

export const homepageSettings: HomepageSettings = {
  showStats: true,
  stats: [
    { value: "50 yrs", label: "Serving southern Cebu", labelShort: "Serving southern Cebu" },
    { value: "60", label: "Licensed bed capacity", labelShort: "Licensed beds" },
    { value: "34", label: "Consultants & residents", labelShort: "Consultants & residents" },
    { value: "24/7", label: "Emergency & delivery room", labelShort: "ER & delivery room" },
  ],
  // Empty: the homepage uses its built-in photos until staff choose others.
  facilityPhotos: {},
  quickLinks: [
    { icon: "event_available", title: "Book Appointment", detail: "Message OPD to request a slot", link: "book" },
    { icon: "badge", title: "Doctors Directory", detail: "Who is in clinic today", link: "doctors" },
    { icon: "assignment", title: "Patients & Visitors", detail: "Admission, billing, visiting hours", link: "patients" },
  ],
  emergencyCard: { title: "Emergency Room", detail: "Open 24 hours · {emergencyNumber}" },
};

export const faqs: Faq[] = [
  {
    question: "Do I need an appointment, or can I walk in?",
    answer:
      "The emergency room and the laboratory accept walk-ins around the clock. Outpatient clinics also accept walk-ins, but consultants see booked patients first — requesting a slot ahead through our Contact page means you will not wait behind the morning queue.",
  },
  {
    question: "What should I bring on the day of my visit?",
    answer:
      "A valid ID for the patient and companion, your PhilHealth MDR or member ID, any HMO letter of authorization, your senior citizen or PWD booklet if applicable, and previous lab or imaging results.",
  },
  {
    question: "Is PhilHealth applied automatically?",
    answer:
      "Yes. Present your MDR or member ID at the admitting desk and the deduction is applied to your bill before you pay. Ward admissions under the case-rate packages carry no balance billing. The billing section will walk through each line with you.",
  },
  {
    question: "How long do laboratory and imaging results take?",
    answer:
      "Routine blood chemistry and urinalysis are released the same day. X-ray and ultrasound reports are ready within 24 hours, and CT studies done before 2 PM are read the same day. Emergency studies are read on call.",
  },
  {
    question: "Can someone stay with the patient overnight?",
    answer:
      "One watcher is allowed per patient at all times. General ward visiting hours are 10 AM to 8 PM, maternity 1 to 7 PM, and ICU 4 to 6 PM. Children under seven are not permitted in patient rooms.",
  },
  {
    question: "Do you have an ambulance for barangay transfers?",
    answer:
      "Yes. Call {emergencyNumber} and the ER will dispatch. We serve Sibonga and the neighbouring towns, and we coordinate transfers to tertiary hospitals in Cebu City when a case needs a higher level of care.",
  },
];

