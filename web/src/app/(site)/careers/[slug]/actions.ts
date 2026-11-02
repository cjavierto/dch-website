"use server";

import { validateApplication, type ApplicationErrors } from "@/lib/careers";
import { getJobPosting, saveJobApplication } from "@/lib/cms";

export type ApplicationState =
  | { status: "idle" }
  | { status: "invalid"; errors: ApplicationErrors }
  | { status: "error" }
  | { status: "sent" };

export async function submitApplication(_prev: ApplicationState, formData: FormData): Promise<ApplicationState> {
  if (String(formData.get("website") ?? "").trim()) return { status: "sent" };

  const job = await getJobPosting(String(formData.get("job") ?? ""));
  if (!job) return { status: "error" };

  const file = formData.get("cv");
  const cv = file instanceof File && file.size > 0 ? file : null;
  const values = {
    name: String(formData.get("name") ?? ""),
    contact: String(formData.get("contact") ?? ""),
    prc: String(formData.get("prc") ?? ""),
    cv: cv ? { name: cv.name, type: cv.type, size: cv.size } : null,
  };

  const errors = validateApplication(values, job.licensed);
  if (Object.keys(errors).length > 0) return { status: "invalid", errors };

  try {
    await saveJobApplication({
      jobSlug: job.slug,
      name: values.name.trim(),
      contact: values.contact.trim(),
      prcLicence: job.licensed ? values.prc.replace(/\s/g, "") : null,
      cv: { name: cv!.name, type: cv!.type, size: cv!.size, data: await cv!.arrayBuffer() },
    });
  } catch (err) {
    console.error("Job application failed", err);
    return { status: "error" };
  }
  return { status: "sent" };
}
