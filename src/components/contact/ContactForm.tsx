"use client";

import { FormEvent, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { buildMailtoUrl, buildWhatsAppUrl } from "@/lib/contact";

type ContactFormProps = {
  dict: Dictionary;
};

export function ContactForm({ dict }: ContactFormProps) {
  const [sent, setSent] = useState(false);
  const inputClass =
    "w-full border border-line bg-paper px-3 py-3 text-navy outline-none transition focus:border-navy";

  function collect(form: HTMLFormElement) {
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const body = [
      `Name: ${name}`,
      phone ? `Phone: ${phone}` : null,
      `Email: ${email}`,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");
    return { name, body };
  }

  function onWhatsApp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { name, body } = collect(event.currentTarget);
    window.open(
      buildWhatsAppUrl(`Rampex contact — ${name}\n\n${body}`),
      "_blank",
      "noopener,noreferrer",
    );
    setSent(true);
    event.currentTarget.reset();
  }

  function onEmail(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;
    if (!form || !form.reportValidity()) return;
    const { name, body } = collect(form);
    window.location.href = buildMailtoUrl(`Rampex contact — ${name}`, body);
    setSent(true);
    form.reset();
  }

  if (sent) {
    return (
      <div className="flex min-h-[320px] items-center bg-white p-6 sm:p-8">
        <p className="text-lg font-semibold text-navy">
          {dict.contact.formSuccess}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onWhatsApp} className="space-y-5 bg-white p-6 sm:p-8">
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-semibold text-navy"
        >
          {dict.contact.formName}
        </label>
        <input id="name" name="name" required className={inputClass} />
      </div>
      <div>
        <label
          htmlFor="phone"
          className="mb-1.5 block text-sm font-semibold text-navy"
        >
          {dict.contact.formPhone}
        </label>
        <input id="phone" name="phone" type="tel" className={inputClass} />
      </div>
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-semibold text-navy"
        >
          {dict.contact.formEmail}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className={inputClass}
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-sm font-semibold text-navy"
        >
          {dict.contact.formMessage}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className={`${inputClass} resize-y`}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex min-h-12 items-center bg-navy px-7 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-navy-soft"
        >
          {dict.contact.formSubmit}
        </button>
        <button
          type="button"
          onClick={onEmail}
          className="inline-flex min-h-12 items-center border border-navy px-7 text-sm font-semibold uppercase tracking-wide text-navy transition hover:bg-paper"
        >
          {dict.contact.formEmailSend}
        </button>
      </div>
    </form>
  );
}
