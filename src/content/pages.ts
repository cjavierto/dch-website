/**
 * Copy for the structured content pages (About, Vision & Values, Patients &
 * Visitors), from the approved prototype. In the CMS these become Page
 * documents; each page's layout stays in code.
 */
import type { ChecklistGroup, Image } from "@/lib/types";
import type { IconName } from "@/components/Icon";

type IconCard = { icon: IconName; title: string; text: string };

export const aboutPage = {
  lead: "A family-run community hospital that has cared for southern Cebu since 1974.",
  story: {
    eyebrow: "Our story",
    heading: "From a six-bed clinic to a 60-bed hospital",
    paragraphs: [
      "Deiparine Community Hospital opened in 1974 as a small lying-in clinic along the national highway in Poblacion, Sibonga. Families who once travelled two hours to Cebu City for a delivery or an appendectomy could finally be treated in their own town.",
      "Five decades later the hospital is DOH-licensed and PhilHealth-accredited, with a 24-hour emergency room, two operating rooms, a delivery suite, and a diagnostic complex that includes digital X-ray, ultrasound, and a 16-slice CT scanner.",
      "Ownership and leadership remain with the Deiparine family, and the majority of the 120-person care team was hired from Sibonga and the neighbouring municipalities of Argao, Dumanjug, and Barili.",
    ],
    photos: [
      { src: "/images/staff-hallway.png", alt: "Hospital corridor" },
      { src: "/images/conference.png", alt: "Staff meeting" },
      { src: "/images/patient-room.png", alt: "Patient room" },
    ] satisfies Image[],
  },
  milestones: [
    { year: "1974", text: "Opened as a six-bed lying-in clinic in Poblacion." },
    { year: "1992", text: "First operating room and 24-hour emergency service." },
    { year: "2009", text: "PhilHealth accreditation and expansion to 60 beds." },
    { year: "2026", text: "16-slice CT scanner installed; imaging open daily." },
  ],
  facts: [
    { icon: "verified", title: "Licenses & accreditation", text: "DOH Level 1 licence, PhilHealth accreditation, and a DOH-certified clinical laboratory and X-ray facility." },
    { icon: "handshake", title: "Partners", text: "Accredited with major HMOs, the LGU indigent programme, and referral tie-ups with tertiary hospitals in Cebu City." },
  ] satisfies IconCard[],
};

export const visionPage = {
  lead: "The commitments we hold ourselves to, written plainly.",
  vision: "That no family in southern Cebu has to travel far, or wait long, for competent and dignified hospital care.",
  mission:
    "To provide accessible emergency, maternal, surgical, and diagnostic services to the people of Sibonga and neighbouring towns — delivered by a locally hired team, priced within reach of every household, and supported by equipment that keeps care close to home.",
  values: [
    { icon: "favorite", title: "Compassion first", text: "Every patient is somebody’s parent, child, or neighbour. Care is explained in Bisaya, at the pace the family needs." },
    { icon: "balance", title: "Fair access", text: "PhilHealth, senior, and PWD benefits are applied without being asked for. No patient is turned away from the ER." },
    { icon: "workspace_premium", title: "Clinical competence", text: "Continuing education for every clinician, and a medical staff committee that reviews outcomes each quarter." },
    { icon: "lock", title: "Confidentiality", text: "Patient records and results are released only to the patient or an authorised representative." },
    { icon: "groups", title: "Community roots", text: "We hire, train, and promote locally, and we bring services out to the barangays through medical missions." },
    { icon: "receipt_long", title: "Honest billing", text: "Itemised statements, posted room rates, and a billing desk that will walk through every line with you." },
  ] satisfies IconCard[],
  rightsNote:
    "Patient rights and responsibilities are posted at every nurses' station and available at the admitting desk on request.",
};

export const patientsPage = {
  lead: "What to bring, what happens on the day, and how billing works.",
  bringIntro:
    "Bring the documents for your situation. If something is missing, come anyway — the admitting desk will tell you what can follow later.",
  checklists: [
    { icon: "badge", title: "Every visit, outpatient or emergency", items: ["Valid ID of the patient and the companion", "List of current medicines and doses", "Known allergies, written down if you can", "Previous lab, X-ray, or ultrasound results"] },
    { icon: "receipt_long", title: "For coverage and discounts", items: ["PhilHealth MDR or member ID", "HMO card and letter of authorization", "Senior citizen or PWD booklet", "Barangay indigency certificate, if applying"] },
    { icon: "bed", title: "If you are being admitted", items: ["Referral or admission order, if you have one", "One designated watcher, with their ID", "Toiletries, towel, and a change of clothes", "Contact number of a next of kin"] },
    { icon: "science", title: "For a laboratory or imaging request", items: ["The physician's written request", "Six hours of fasting for abdominal studies", "A full bladder for pelvic ultrasound", "Tell staff if you are pregnant"] },
  ] satisfies ChecklistGroup[],
  stepsIntro: "A typical outpatient visit, from the gate to going home.",
  steps: [
    { title: "Register at the admitting desk", text: "Give your name and booking reference. New patients fill a short record form." },
    { title: "Vital signs at the OPD station", text: "A nurse takes your blood pressure, temperature, and weight before you see the doctor." },
    { title: "Consultation", text: "Booked patients are called in schedule order. Bring your questions written down if it helps." },
    { title: "Tests, if ordered", text: "The laboratory and imaging sections are on the ground floor. Most plain studies finish in under thirty minutes." },
    { title: "Billing, pharmacy, and home", text: "PhilHealth and discounts are applied at the billing window. The pharmacy is open until 9:00 PM." },
  ],
  billing: [
    "PhilHealth, HMO, and senior or PWD discounts are applied at the billing window before you pay — you do not have to ask for them.",
    "Ward admissions under the PhilHealth case-rate packages carry no balance billing. Private and semi-private rooms are billed with the PhilHealth benefit deducted first.",
    "Every statement is itemised, and the billing desk will walk through each line with you.",
  ],
  billingNote:
    "The current schedule of room rates and common procedure fees is posted at the admitting desk and the billing section. Call {trunkline} for an estimate before you come in.",
};
