import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getLegalPages, getSiteSettings } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Patient rights & responsibilities",
  description: "The rights of every patient at Deiparine Community Hospital, and the responsibilities patients and watchers share.",
};

export default async function PatientRightsPage() {
  const [{ patientRights }, settings] = await Promise.all([getLegalPages(), getSiteSettings()]);
  return (
    <LegalPage title="Patient rights & responsibilities" page={patientRights} emergencyNumber={settings.emergencyNumber} />
  );
}
