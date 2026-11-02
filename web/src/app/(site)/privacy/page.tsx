import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getLegalPages, getSiteSettings } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "How Deiparine Community Hospital handles personal information sent through this website.",
};

export default async function PrivacyPage() {
  const [{ privacy }, settings] = await Promise.all([getLegalPages(), getSiteSettings()]);
  return <LegalPage title="Privacy notice" page={privacy} emergencyNumber={settings.emergencyNumber} />;
}
