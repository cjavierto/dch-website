/**
 * Starter copy for the Privacy notice and Patient rights pages. There is no
 * prototype copy for these; this is a plain-language draft written for the
 * website and must be reviewed by DCH's Data Protection Officer and
 * management before launch. Edit it in the admin under Settings → Privacy &
 * patient rights. `{email}`, `{trunkline}` and `{emergencyNumber}` are filled
 * from Website settings.
 */
import type { Block } from "@/lib/types";

export const privacyPage: { intro: string; body: Block[] } = {
  intro:
    "How Deiparine Community Hospital collects, uses and protects the personal information you give us through this website, under the Data Privacy Act of 2012 (Republic Act No. 10173).",
  body: [
    { type: "h2", text: "What we collect through this website" },
    {
      type: "ul",
      items: [
        "Contact form: your name, mobile number, email address if you give one, the subject you choose, and your message.",
        "Job applications: your name, email or mobile number, PRC licence number where the role needs one, and your CV.",
        "Appointment requests, once online booking opens: your name, mobile number, PhilHealth number if you give one, whether it is your first visit, your reason for the visit, and the doctor, date and time you choose.",
      ],
    },
    {
      type: "p",
      text: "Please do not send medical records, test results or other health details through the website. Bring them to the hospital instead.",
    },
    { type: "h2", text: "How we use it" },
    {
      type: "ul",
      items: [
        "To reply to your message and schedule appointments.",
        "To assess job applications and contact applicants.",
        "To keep a record of requests we have handled.",
      ],
    },
    {
      type: "p",
      text: "We do not sell your information, and we do not use it for advertising.",
    },
    { type: "h2", text: "Who can see it" },
    {
      type: "p",
      text: "Only authorised hospital staff who need it to respond — the OPD and admitting desk, human resources, and administration. The company that hosts the website stores the data on our behalf and may not use it for anything else.",
    },
    { type: "h2", text: "How long we keep it" },
    {
      type: "p",
      text: "Contact messages and appointment requests are kept only as long as we need them to respond and follow up, in line with the hospital's records policy. CVs sent without a matching opening are kept on file for six months.",
    },
    { type: "h2", text: "Cookies" },
    {
      type: "p",
      text: "The public website does not use advertising or tracking cookies. Staff who sign in to manage the website receive a cookie that keeps them signed in. The icon font is loaded from Google Fonts, which receives your browser's IP address when a page loads.",
    },
    { type: "h2", text: "Your rights" },
    {
      type: "p",
      text: "Under the Data Privacy Act you have the right to be informed, to access your personal information, to have it corrected, to object to its processing, to have it erased or blocked, to data portability, and to claim damages. You may also file a complaint with the National Privacy Commission.",
    },
    { type: "h2", text: "Contact us" },
    {
      type: "p",
      text: "For privacy questions or requests, email {email} and address your message to our Data Protection Officer, or call the trunkline at {trunkline}.",
    },
  ],
};

export const patientRightsPage: { intro: string; body: Block[] } = {
  intro:
    "Every patient at DCH has rights, and every patient and watcher shares a few responsibilities. This page is a summary — the full statement is posted at every nurses' station and available at the admitting desk.",
  body: [
    { type: "h2", text: "Your rights as a patient" },
    {
      type: "ul",
      items: [
        "To appropriate and humane care, without discrimination. In an emergency, the ER will not ask for a deposit before treating you (Republic Act No. 10932).",
        "To be told about your condition, the treatment we recommend, its risks and alternatives, and the expected costs — in Cebuano, Filipino or English.",
        "To give or refuse consent before any procedure, and to refuse treatment after its risks are explained.",
        "To privacy and confidentiality. Your records and results are released only to you or someone you authorise in writing.",
        "To choose your doctor, and to ask for a second opinion.",
        "To an itemised bill, with PhilHealth, HMO, senior and PWD benefits applied.",
        "To leave the hospital. We will not detain you for an unpaid bill (Republic Act No. 9439); the billing section will arrange a promissory note.",
        "To a copy of your medical records, on written request.",
        "To have your religious beliefs respected, and to see a minister of your faith.",
        "To refuse to take part in research.",
        "To receive visitors and messages, within the hospital's visiting rules.",
        "To raise a concern or complaint without it affecting your care.",
      ],
    },
    { type: "h2", text: "Your responsibilities" },
    {
      type: "ul",
      items: [
        "Give complete and accurate information about your health, medicines and allergies.",
        "Follow the treatment plan you agreed to, or tell your doctor if you decide not to.",
        "Respect other patients and hospital staff, and follow the visiting rules — one watcher per patient, and no children under 7 in patient rooms.",
        "Bring your PhilHealth, HMO, senior or PWD documents, and settle your bill or make arrangements at the billing section.",
        "Ask questions whenever something is unclear.",
      ],
    },
    { type: "h2", text: "Raising a concern" },
    {
      type: "p",
      text: "Speak first to the nurse in charge of your ward or the admitting desk. You can also send us a message through the Contact page, or call the trunkline at {trunkline}. Concerns are reviewed by hospital administration.",
    },
    {
      type: "p",
      text: "In an emergency, go straight to the ER or call {emergencyNumber}.",
    },
  ],
};
