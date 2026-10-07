"use client";

import { useState, type FormEvent } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { profile } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";

const contactCards = [
  { icon: Mail, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { icon: Phone, label: "Phone", value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
  { icon: MapPin, label: "Location", value: profile.location, href: undefined },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = encodeURIComponent(`Portfolio inquiry from ${form.name || "a visitor"}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name}${form.email ? ` (${form.email})` : ""}`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  }

  return (
    <section id="contact" className="section">
      <div className="site-container">
        <SectionHeading index="06" eyebrow="Contact" title="Good software starts with a conversation."
          description="Open to new opportunities, collaborations, and interesting problems. Reach out — I usually reply within a day." />
        <div className="section-content grid grid-cols-1 gap-8 lg:grid-cols-5">
          <Reveal className="space-y-3 lg:col-span-2">
            {contactCards.map((card) => {
              const Icon = card.icon;
              const content = <>
                <span className="icon-tile"><Icon size={18} aria-hidden="true" /></span>
                <div className="min-w-0">
                  <p className="meta">{card.label}</p>
                  <p className="mt-1 break-words text-sm font-medium">{card.value}</p>
                </div>
              </>;
              return card.href ? (
                <a key={card.label} href={card.href} className="contact-card transition-colors hover:border-accent">{content}</a>
              ) : <div key={card.label} className="contact-card">{content}</div>;
            })}
            <div className="flex items-center gap-3 pt-3">
              <a href={profile.github} target="_blank" rel="noreferrer" className="icon-button" aria-label="GitHub"><FaGithub size={18} aria-hidden="true" /></a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="icon-button" aria-label="LinkedIn"><FaLinkedin size={18} aria-hidden="true" /></a>
            </div>
          </Reveal>
          <Reveal className="lg:col-span-3" delay={0.06}>
            <form onSubmit={handleSubmit} className="contact-form space-y-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="form-label">Name</label>
                  <input id="name" name="name" autoComplete="name" required value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })} className="field mt-2" placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="email" className="form-label">Email</label>
                  <input id="email" name="email" type="email" autoComplete="email" required value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })} className="field mt-2" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="form-label">Message</label>
                <textarea id="message" name="message" required rows={5} value={form.message}
                  onChange={(event) => setForm({ ...form, message: event.target.value })} className="field mt-2" placeholder="Tell me about your project or opportunity..." />
              </div>
              <Button type="submit" className="w-full sm:w-auto">Send Message <Send size={16} aria-hidden="true" /></Button>
              <p className="meta">Opens your email client with the message pre-filled — nothing is stored or sent from this site.</p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
