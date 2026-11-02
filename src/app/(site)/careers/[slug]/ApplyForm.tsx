"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { Field, FieldError, fieldProps, Honeypot } from "@/components/ui/FormField";
import {
  CV_ACCEPT,
  validateApplication,
  type ApplicationErrors,
  type ApplicationField,
  type ApplicationValues,
} from "@/lib/careers";
import { submitApplication, type ApplicationState } from "./actions";

const P = "apply";
const ORDER: ApplicationField[] = ["name", "contact", "prc", "cv"];

/**
 * "Apply for this role" sidebar form with CV upload. Submitted manually (not
 * via the form action) so a failed server check does not clear the chosen
 * file; without JavaScript it still posts through the action.
 */
export function ApplyForm({ jobSlug, licensed }: { jobSlug: string; licensed: boolean }) {
  const [values, setValues] = useState<Omit<ApplicationValues, "cv">>({ name: "", contact: "", prc: "" });
  const [cv, setCv] = useState<File | null>(null);
  const [clientErrors, setClientErrors] = useState<ApplicationErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [state, formAction, pending] = useActionState<ApplicationState, FormData>(submitApplication, { status: "idle" });
  const [seen, setSeen] = useState<ApplicationState | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const serverErrors = state.status === "invalid" && seen !== state ? state.errors : {};
  const errors: ApplicationErrors = { ...serverErrors, ...clientErrors };
  const all = (next: Partial<ApplicationValues>): ApplicationValues => ({
    ...values,
    cv: cv ? { name: cv.name, type: cv.type, size: cv.size } : null,
    ...next,
  });

  const update = (field: "name" | "contact" | "prc", value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    setSeen(state);
    if (attempted) setClientErrors(validateApplication(all({ [field]: value }), licensed));
  };

  if (state.status === "sent") {
    return (
      <div role="status" className="flex flex-col items-start gap-3">
        <Icon name="check_circle" size={34} className="text-green-600" />
        <h2 className="text-lg font-bold nav:text-[19px]">Application received</h2>
        <p className="text-[14.5px] leading-[1.6] text-ink-700">
          Thank you. HR screens applications within three working days and will contact you by the email or number you
          gave.
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      encType="multipart/form-data"
      onSubmit={(e) => {
        e.preventDefault();
        setAttempted(true);
        const found = validateApplication(all({}), licensed);
        setClientErrors(found);
        const first = ORDER.find((f) => found[f]);
        if (first) {
          formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
          return;
        }
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      <h2 className="mb-4 text-lg font-bold nav:text-[19px]">Apply for this role</h2>
      {state.status === "error" && (
        <p role="alert" className="mb-4 flex gap-2.5 rounded-input bg-red-050 px-3.5 py-3 text-sm leading-[1.5] text-red-700">
          <Icon name="error" size={20} />
          We couldn&apos;t send your application just now. Please try again.
        </p>
      )}
      <input type="hidden" name="job" value={jobSlug} />
      <div className="flex flex-col gap-3.5">
        <Field prefix={P} id="name" label="Full name" error={errors.name}>
          <input
            {...fieldProps(P, "name", errors)}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            autoComplete="name"
            placeholder="Juan dela Cruz"
            maxLength={100}
          />
        </Field>
        <Field prefix={P} id="contact" label="Email or mobile" error={errors.contact}>
          <input
            {...fieldProps(P, "contact", errors)}
            value={values.contact}
            onChange={(e) => update("contact", e.target.value)}
            autoComplete="email"
            placeholder="0917 000 0000"
          />
        </Field>
        {licensed && (
          <Field prefix={P} id="prc" label="PRC licence no." error={errors.prc}>
            <input
              {...fieldProps(P, "prc", errors)}
              value={values.prc}
              onChange={(e) => update("prc", e.target.value)}
              inputMode="numeric"
              placeholder="0000000"
            />
          </Field>
        )}

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${P}-cv`}
            className={`flex cursor-pointer flex-col items-center rounded-button border-[1.5px] border-dashed p-5 text-center text-sm transition-colors duration-[120ms] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-navy-700 hover:border-navy-700 ${
              errors.cv ? "border-red-700" : "border-line-300"
            } ${cv ? "text-ink-900" : "text-ink-400"}`}
          >
            <Icon name="upload_file" size={26} className="mb-1.5" />
            {cv ? (
              <>
                <span className="font-semibold break-all">{cv.name}</span>
                <span className="mt-0.5 text-[12.5px] text-ink-400">
                  {cv.size < 1024 * 1024 ? `${Math.max(1, Math.round(cv.size / 1024))} KB` : `${(cv.size / 1024 / 1024).toFixed(1)} MB`} · tap to change
                </span>
              </>
            ) : (
              <>
                Attach CV (PDF or DOCX)
                <span className="mt-0.5 text-[12.5px]">Up to 5 MB</span>
              </>
            )}
            <input
              id={`${P}-cv`}
              name="cv"
              type="file"
              accept={CV_ACCEPT}
              className="sr-only"
              aria-invalid={Boolean(errors.cv) || undefined}
              aria-describedby={errors.cv ? `${P}-cv-error` : undefined}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setCv(file);
                setSeen(state);
                if (attempted)
                  setClientErrors(
                    validateApplication(
                      all({ cv: file ? { name: file.name, type: file.type, size: file.size } : null }),
                      licensed,
                    ),
                  );
              }}
            />
          </label>
          <FieldError id={`${P}-cv-error`} error={errors.cv} />
        </div>

        <Honeypot />
        <button
          type="submit"
          disabled={pending}
          className="rounded-button bg-navy-700 p-3.5 text-[15.5px] font-bold text-white transition-colors duration-[120ms] hover:bg-navy-900 disabled:pointer-events-none disabled:opacity-50"
        >
          {pending ? "Sending…" : "Submit application"}
        </button>
      </div>
    </form>
  );
}
