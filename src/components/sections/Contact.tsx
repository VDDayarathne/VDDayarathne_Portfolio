"use client";

import { useState, type FormEvent } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { profile } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";

const contactCards = [
  { icon: Mail, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { icon: Phone, label: "Phone", value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
  { icon: MapPin, label: "Location", value: profile.location, href: undefined },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio inquiry from ${form.name || "a visitor"}`);
    const body = encodeURIComponent(
      `${form.message}\n\n— ${form.name}${form.email ? ` (${form.email})` : ""}`
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  }

  return (
    <section id="contact" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          index="06"
          eyebrow="Contact"
          title="Let's build something."
          description="Open to new opportunities, collaborations, and interesting problems. Reach out — I usually reply within a day."
          align="center"
        />

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-5 gap-10">
          <Reveal className="lg:col-span-2 space-y-4" delay={0.1}>
            {contactCards.map((card) => {
              const Icon = card.icon;
              const content = (
                <div className="glass-panel rounded-2xl p-6 flex items-center gap-4 h-full hover:border-accent-2/50 transition-colors">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-2">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wide">{card.label}</p>
                    <p className="mt-0.5 font-medium">{card.value}</p>
                  </div>
                </div>
              );
              return card.href ? (
                <a key={card.label} href={card.href} data-cursor-hover className="block">
                  {content}
                </a>
              ) : (
                <div key={card.label}>{content}</div>
              );
            })}

            <div className="flex items-center gap-4 pt-2">
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                data-cursor-hover
                className="glass-panel rounded-full p-3 hover:text-accent-2 transition-colors"
                aria-label="GitHub"
              >
                <FaGithub size={18} />
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                data-cursor-hover
                className="glass-panel rounded-full p-3 hover:text-accent-2 transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={18} />
              </a>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-3" delay={0.2}>
            <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="text-sm text-muted">
                    Name
                  </label>
                  <input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-border bg-background/60 px-4 py-3 outline-none focus:border-accent-2 transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm text-muted">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-border bg-background/60 px-4 py-3 outline-none focus:border-accent-2 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="text-sm text-muted">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-border bg-background/60 px-4 py-3 outline-none focus:border-accent-2 transition-colors resize-none"
                  placeholder="Tell me about your project or opportunity..."
                />
              </div>
              <MagneticButton
                as="button"
                className="w-full sm:w-auto justify-center bg-foreground text-background hover:bg-accent-2"
              >
                Send Message <Send size={16} />
              </MagneticButton>
              <p className="text-xs text-muted">
                Opens your email client with the message pre-filled — nothing is stored or sent from this site.
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
