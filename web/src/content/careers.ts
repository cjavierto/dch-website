/**
 * Job postings. Only the ER staff nurse posting has full copy in the
 * prototype; the others show their basics until written in the CMS.
 */
import type { JobPosting } from "@/lib/types";

const location = "Sibonga, Cebu";

export const jobPostings: JobPosting[] = [
  {
    slug: "staff-nurse-emergency-room",
    title: "Staff Nurse – Emergency Room",
    department: "Nursing Service",
    icon: "vaccines",
    employmentType: "Full-time",
    shift: "rotating shifts",
    openings: 2,
    location,
    licensed: true,
    role: "You will work in a six-bay emergency room alongside a resident physician and two nursing aides, handling triage, resuscitation, and stabilisation for walk-ins and ambulance arrivals from Sibonga and neighbouring towns.",
    duties: [
      "Perform triage and initial assessment on arrival, and escalate red-tag cases immediately.",
      "Administer medications and IV therapy per physician order, with accurate charting.",
      "Assist in minor procedures — suturing, splinting, nebulisation, catheterisation.",
      "Prepare patients for admission, transfer, or referral to tertiary hospitals.",
      "Endorse cases clearly at shift change and maintain ER supply readiness.",
    ],
    requirements: [
      "Registered Nurse with an active PRC licence.",
      "At least one year of ER, ward, or ICU experience (new graduates with strong internship records are considered).",
      "Current BLS certification; ACLS an advantage.",
      "Comfortable explaining care in Cebuano and English.",
      "Willing to work rotating shifts, weekends, and holidays.",
    ],
    compensation:
      "Competitive salary based on experience, night and holiday differentials, SSS/PhilHealth/Pag-IBIG, service incentive leave, free consults for staff and immediate family, and sponsored CPD units.",
    process: [
      "CV screening within 3 working days",
      "Interview with Chief Nurse",
      "Skills demonstration & medical exam",
      "Job offer and orientation",
    ],
  },
  { slug: "staff-nurse-delivery-room", title: "Staff Nurse – Delivery Room", department: "Nursing Service", icon: "pregnant_woman", employmentType: "Full-time", location, licensed: true },
  { slug: "medical-technologist", title: "Medical Technologist", department: "Clinical Laboratory", icon: "labs", employmentType: "Full-time", location, licensed: true },
  { slug: "radiologic-technologist", title: "Radiologic Technologist", department: "Imaging & Radiology", icon: "radiology", employmentType: "Full-time", location, licensed: true },
  { slug: "midwife", title: "Midwife", department: "Maternity Ward", icon: "child_care", employmentType: "Full-time", location, licensed: true },
  { slug: "billing-philhealth-clerk", title: "Billing & PhilHealth Clerk", department: "Finance", icon: "receipt_long", employmentType: "Full-time", location, licensed: false },
  { slug: "resident-physician", title: "Resident Physician", department: "Medical Staff", icon: "stethoscope", employmentType: "Contract", location, licensed: true },
];

export const careerBenefits = [
  "Government-mandated benefits from day one",
  "Free consults and discounted care for staff family",
  "Sponsored CPD units and in-house BLS/ACLS training",
  "Work close to home — no Cebu City commute",
];
