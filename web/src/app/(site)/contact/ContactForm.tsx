"use client";

import { useActionState, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { Field as BaseField, fieldProps as baseFieldProps, Honeypot, inputClass } from "@/components/ui/FormField";
import { telHref } from "@/lib/format";
import {
  CONTACT_SUBJECTS,
  MESSAGE_MAX,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactSubject,
  type ContactValues,
} from "@/lib/contact";
import { submitContact, type ContactFormState } from "./actions";

const FIELD_ORDER: ContactField[] = ["name", "mobile", "email", "subject", "message"];

/**
 * "Send us a message" form. Validates in the browser for instant inline
 * errors; the server action re-validates and is the authority (and works
 * without JavaScript).
 */
export function ContactForm({
  initialSubject,
  emergencyNumber,
}: {
  initialSubject: ContactSubject;
  emergencyNumber: string;
}) {
  const empty: ContactValues = { name: "", mobile: "", email: "", subject: initialSubject, message: "" };
  const [values, setValues] = useState<ContactValues>(empty);
  const [clientErrors, setClientErrors] = useState<ContactErrors>({});
  // After the first submit attempt, errors update as people type.
  const [attempted, setAttempted] = useState(false);
  const [state, formAction, pending] = useActionState<ContactFormState, FormData>(submitContact, {
    status: "idle",
  });
  const formRef = useRef<HTMLFormElement>(null);

  // Server errors show until the person edits the form again.
  const [serverErrorsSeen, setServerErrorsSeen] = useState<ContactFormState | null>(null);
  const serverErrors = state.status === "invalid" && serverErrorsSeen !== state ? state.errors : {};
  const errors: ContactErrors = { ...serverErrors, ...clientErrors };

  const update = (field: ContactField, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    setServerErrorsSeen(state);
    if (attempted) setClientErrors(validateContact(next));
  };

  if (state.status === "sent") {
    return (
      <div role="status" className="flex flex-col items-start gap-3 py-2">
        <Icon name="check_circle" size={36} className="text-green-600" />
        <h2 className="font-display text-[22px] font-bold text-ink-900 nav:text-2xl">Message sent</h2>
        <p className="text-[15px] leading-[1.6] text-ink-700">
          Thank you. We&apos;ll reply within one working day — by text to the mobile number you
          gave us.
        </p>
        <p className="text-[13.5px] leading-[1.5] text-ink-400">
          Not for emergencies. For urgent cases call{" "}
          <a href={telHref(emergencyNumber)} className="font-semibold">
            {emergencyNumber}
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 rounded-button border border-line-300 px-[19px] py-[13px] text-[14.5px] font-bold text-ink-900 hover:border-navy-700 hover:text-navy-700"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      onSubmit={(e) => {
        setAttempted(true);
        const found = validateContact(values);
        setClientErrors(found);
        const first = FIELD_ORDER.find((f) => found[f]);
        if (first) {
          e.preventDefault();
          formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
        }
      }}
    >
      <h2 className="mb-2 font-display text-[22px] font-bold text-ink-900 nav:text-2xl">Send us a message</h2>
      <p className="mb-[22px] text-[15px] leading-[1.6] text-ink-700">
        For appointments, tell us the department or doctor and your preferred day — OPD staff
        will text you to confirm a schedule within one working day.
      </p>

      {state.status === "error" && (
        <p role="alert" className="mb-4 flex gap-2.5 rounded-input bg-red-050 px-3.5 py-3 text-[14.5px] leading-[1.5] text-red-700">
          <Icon name="error" size={20} />
          We couldn&apos;t send your message just now. Please try again, or call the trunkline.
        </p>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 nav:gap-4">
        <Field id="name" label="Full name" error={errors.name}>
          <input
            {...fieldProps("name", errors)}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            autoComplete="name"
            placeholder="Juan dela Cruz"
            maxLength={100}
            required
          />
        </Field>
        <Field id="mobile" label="Mobile number" error={errors.mobile}>
          <input
            {...fieldProps("mobile", errors)}
            value={values.mobile}
            onChange={(e) => update("mobile", e.target.value)}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0917 000 0000"
            required
          />
        </Field>
        <Field id="email" label="Email (optional)" error={errors.email}>
          <input
            {...fieldProps("email", errors)}
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            type="email"
            autoComplete="email"
            placeholder="juan@email.com"
          />
        </Field>
        <Field id="subject" label="Subject" error={errors.subject}>
          <div className="relative">
            <select
              {...fieldProps("subject", errors)}
              value={values.subject}
              onChange={(e) => update("subject", e.target.value)}
              className={`${inputClass(Boolean(errors.subject))} w-full appearance-none bg-white pr-10`}
            >
              {CONTACT_SUBJECTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <Icon
              name="expand_more"
              size={20}
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-500"
            />
          </div>
        </Field>
        <Field id="message" label="Message" error={errors.message} wide>
          <textarea
            {...fieldProps("message", errors)}
            value={values.message}
            onChange={(e) => update("message", e.target.value)}
            rows={5}
            maxLength={MESSAGE_MAX}
            placeholder="e.g. Follow-up with Dr. Deiparine, any Monday morning"
            className={`${inputClass(Boolean(errors.message))} resize-y`}
            required
          />
        </Field>
      </div>

      <Honeypot />

      <div className="mt-[22px] flex flex-wrap items-center gap-3.5">
        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-button-lg bg-navy-700 px-6 py-[15px] text-[15.5px] font-bold text-white transition-colors duration-[120ms] hover:bg-navy-900 disabled:pointer-events-none disabled:opacity-50 nav:w-auto nav:rounded-button nav:py-3.5"
        >
          <Icon name="send" size={20} />
          {pending ? "Sending…" : "Send message"}
        </button>
        <span className="flex-[1_1_240px] text-[13.5px] leading-[1.5] text-ink-400">
          Not for emergencies. For urgent cases call{" "}
          <a href={telHref(emergencyNumber)} className="font-semibold text-ink-700 hover:text-navy-700">
            {emergencyNumber}
          </a>
          .
        </span>
      </div>
    </form>
  );
}

const fieldProps = (field: ContactField, errors: ContactErrors) => baseFieldProps("contact", field, errors);

function Field(props: Omit<Parameters<typeof BaseField>[0], "prefix">) {
  return <BaseField prefix="contact" {...props} />;
}
