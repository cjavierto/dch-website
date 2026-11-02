/**
 * Departments. Only Imaging & Radiology has full detail-page copy in the
 * prototype; the other departments show their summary, schedule and doctors
 * until DCH writes their pages in the CMS.
 */
import { routes } from "@/lib/routes";
import type { Service } from "@/lib/types";

export const services: Service[] = [
  {
    slug: "emergency-medicine",
    name: "Emergency Medicine",
    icon: "emergency",
    emergency: true,
    summary:
      "Triage, resuscitation, and observation beds. Ambulance dispatch within Sibonga and nearby towns.",
    summaryShort: "Open 24/7 · walk-in",
    image: { src: "/images/emergency.png", alt: "Emergency room" },
    categories: ["emergency"],
    categoryLabel: "Emergency",
    tags: [
      { label: "Open 24/7", tone: "danger" },
      { label: "Walk-in", tone: "info" },
    ],
    inMegaMenu: false,
    home: {
      title: "Emergency & Trauma",
      summary: "Round-the-clock ER with resident physicians, ambulance dispatch, and triage bay.",
      summaryShort: "Open 24 hours, ambulance dispatch",
      sort: 1,
    },
    detail: {
      lead: "Triage, resuscitation, and observation beds, staffed around the clock. Ambulance dispatch within Sibonga and nearby towns.",
      schedule: [
        { icon: "schedule", text: "Open 24 hours, every day" },
        { icon: "call", text: "ER and ambulance: {emergencyNumber}" },
      ],
    },
  },
  {
    slug: "internal-medicine",
    name: "Internal Medicine",
    icon: "cardiology",
    summary: "Diabetes, hypertension, and respiratory care with in-house 2D-echo and ECG.",
    summaryShort: "Mon–Sat · 6 consultants",
    image: { src: "/images/patient-room.png", alt: "Patient room" },
    categories: ["inpatient", "outpatient"],
    categoryLabel: "Outpatient & inpatient",
    tags: [
      { label: "Mon–Sat", tone: "info" },
      { label: "6 consultants", tone: "success" },
    ],
    menuSummary: "Adult primary & chronic care",
    inMegaMenu: true,
    detail: {
      lead: "Diabetes, hypertension, and respiratory care with in-house 2D-echo and ECG.",
      schedule: [{ icon: "schedule", text: "Outpatient clinics: Mon–Sat" }],
    },
  },
  {
    slug: "ob-gynecology",
    name: "OB-Gynecology",
    icon: "pregnant_woman",
    summary: "Prenatal packages, ultrasound, delivery room, and family planning counselling.",
    summaryShort: "PhilHealth package",
    image: { src: "/images/ultrasound.png", alt: "Ultrasound room" },
    categories: ["maternal-child", "inpatient", "outpatient"],
    categoryLabel: "Maternal & child",
    tags: [
      { label: "By appointment", tone: "info" },
      { label: "PhilHealth package", tone: "notice" },
    ],
    menuSummary: "Prenatal, delivery, women's health",
    inMegaMenu: true,
    home: {
      title: "Maternity & OB-Gyne",
      summary: "Prenatal check-ups, normal and caesarean delivery, newborn screening.",
      summaryShort: "Prenatal, delivery, newborn screening",
      sort: 2,
    },
    detail: {
      lead: "Prenatal packages, ultrasound, delivery room, and family planning counselling.",
      schedule: [
        { icon: "schedule", text: "Clinics by appointment" },
        { icon: "emergency", text: "Delivery room: open 24 hours" },
      ],
    },
  },
  {
    slug: "pediatrics",
    name: "Pediatrics",
    icon: "child_care",
    summary: "Newborn to teen care.",
    summaryShort: "Mon–Fri · 2–5 PM",
    categories: ["maternal-child", "outpatient"],
    categoryLabel: "Maternal & child",
    tags: [
      { label: "Mon–Fri", tone: "info" },
      { label: "2–5 PM", tone: "success" },
    ],
    menuSummary: "Newborn to teen care",
    inMegaMenu: true,
    detail: {
      lead: "Newborn to teen care.",
      schedule: [{ icon: "schedule", text: "Clinic: Mon–Fri, 2–5 PM" }],
    },
  },
  {
    slug: "general-surgery",
    name: "Surgery & Anesthesia",
    icon: "surgical",
    summary: "Appendectomy, hernia repair, caesarean section, and minor skin procedures.",
    summaryShort: "Two operating rooms",
    image: { src: "/images/cath-lab.png", alt: "Procedure room" },
    categories: ["inpatient"],
    categoryLabel: "Inpatient",
    tags: [{ label: "2 operating rooms", tone: "info" }],
    menuName: "General Surgery",
    menuSummary: "Minor & major operations",
    inMegaMenu: true,
    home: {
      title: "Surgery",
      summary: "Two operating rooms for general, orthopedic, and minor procedures.",
      summaryShort: "Two operating rooms",
      sort: 3,
    },
    detail: {
      lead: "Appendectomy, hernia repair, caesarean section, and minor skin procedures in two operating rooms.",
    },
  },
  {
    slug: "imaging-radiology",
    name: "Imaging & Radiology",
    icon: "radiology",
    summary: "Digital X-ray, whole-abdomen ultrasound, and 16-slice CT with same-day reading.",
    summaryShort: "Mon–Sun · results in 24h",
    image: { src: "/images/imaging.png", alt: "CT suite" },
    categories: ["diagnostics"],
    categoryLabel: "Diagnostics",
    tags: [
      { label: "Mon–Sun", tone: "info" },
      { label: "Results in 24h", tone: "success" },
    ],
    menuSummary: "X-ray, ultrasound, CT scan",
    inMegaMenu: true,
    home: {
      title: "Diagnostics",
      summary: "Digital X-ray, ultrasound, ECG, and a full clinical laboratory.",
      summaryShort: "X-ray, ultrasound, CT, laboratory",
      sort: 4,
    },
    detail: {
      lead: "Digital X-ray, ultrasound, ECG, and 16-slice CT — read the same day, beside the emergency room.",
      ctaLabel: "Schedule a study",
      secondaryCta: { label: "Meet the radiologist", href: routes.doctors },
      overview: {
        heading: "Diagnostics without the trip to the city",
        paragraphs: [
          "The imaging section sits on the ground floor next to the emergency room, so trauma, stroke, and acute abdominal cases can be scanned within minutes of triage. Outpatients are seen by appointment or walk-in, with most plain studies completed in under thirty minutes.",
          "All studies are interpreted by a licensed radiologist. Reports for studies done before 2 PM are released the same day; emergency studies are read on call, twenty-four hours.",
        ],
      },
      procedures: [
        { icon: "radiology", title: "Digital X-ray", detail: "Chest, skull, spine, extremities" },
        { icon: "monitor_heart", title: "16-slice CT scan", detail: "Head, chest, abdomen, spine; with or without contrast" },
        { icon: "pregnant_woman", title: "Ultrasound", detail: "Prenatal, whole abdomen, KUB, thyroid, breast" },
        { icon: "cardiology", title: "ECG & 2D-echo", detail: "Resting ECG daily; 2D-echo Tue & Fri" },
      ],
      preparation: [
        "Bring a physician's request — required for every study.",
        "Fast for six hours before an abdominal ultrasound or a contrast CT.",
        "For pelvic ultrasound, drink water and keep a full bladder.",
        "Tell the technologist if you are pregnant or allergic to contrast dye.",
        "Bring any previous imaging results for comparison.",
      ],
      schedule: [
        { icon: "schedule", text: "Outpatient: daily 8 AM – 5 PM" },
        { icon: "emergency", text: "Emergency studies: 24/7 on call" },
        { icon: "meeting_room", text: "Ground floor, beside the ER" },
        { icon: "call", text: "{trunkline} local 112" },
      ],
      staff: [
        { name: "Dr. Edgar P. Pacaña", role: "Radiologist", initials: "EP" },
        { name: "Jomar L. Tabada, RRT", role: "Chief Radiologic Technologist", initials: "JL" },
      ],
      emergencyTitle: "Emergency imaging",
      gallery: [
        { src: "/images/imaging.png", alt: "CT suite" },
        { src: "/images/ultrasound.png", alt: "Ultrasound room" },
        { src: "/images/cath-lab.png", alt: "Procedure room" },
      ],
    },
  },
  {
    slug: "laboratory",
    name: "Clinical Laboratory",
    icon: "labs",
    summary: "Hematology, blood chemistry, urinalysis, drug testing, and pre-employment panels.",
    summaryShort: "Open 24/7",
    image: { src: "/images/conference.png", alt: "Laboratory" },
    categories: ["diagnostics"],
    categoryLabel: "Diagnostics",
    tags: [{ label: "Open 24/7", tone: "info" }],
    menuName: "Laboratory",
    menuSummary: "Blood chem, hematology, swab",
    inMegaMenu: true,
    detail: {
      lead: "Hematology, blood chemistry, urinalysis, drug testing, and pre-employment panels.",
      schedule: [{ icon: "schedule", text: "Open 24 hours, walk-in" }],
    },
  },
];
