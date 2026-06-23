"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company?: string;
  /** Put an image in /public (e.g. /testimonials/jane.jpg) and set the path here.
   *  Leave empty to show an initials avatar. */
  image?: string;
}

/* ───────────────────────────────────────────────────────────────────────────
 * 👉 REPLACE THESE PLACEHOLDERS with real testimonials.
 * For each: drop the client's photo in /public/testimonials/, then fill in
 * quote / name / role / company / image. Add or remove entries freely.
 * ─────────────────────────────────────────────────────────────────────────── */
const testimonials: Testimonial[] = [
  {
    quote:
      "Add a real client quote here — what Zeff built, how he worked, and the impact it had on the project.",
    name: "Client Name",
    role: "Founder",
    company: "Company",
    image: "",
  },
  {
    quote:
      "Add a second testimonial — ideally one that mentions a concrete result, deadline met, or problem solved.",
    name: "Client Name",
    role: "CTO",
    company: "Company",
    image: "",
  },
  {
    quote:
      "Add a third testimonial — a teammate or mentee works great here, given the 100+ interns mentored.",
    name: "Client Name",
    role: "Project Manager",
    company: "Company",
    image: "",
  },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function Testimonials() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-20 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12 text-center"
      >
        <span className="mb-4 inline-block rounded-full border border-cyan-400/30 bg-cyan-400/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-cyan-300">
          Testimonials
        </span>
        <h2 className="font-tech text-3xl font-bold text-white sm:text-4xl md:text-5xl">
          What People{" "}
          <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            Say
          </span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-gray-400">
          Kind words from clients and teammates I&apos;ve worked with.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition-all duration-300 hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(34,211,238,0.18)]"
          >
            <FaQuoteLeft className="mb-4 text-xl text-cyan-400/60" />
            <p className="flex-1 text-sm leading-relaxed text-gray-300">
              {t.quote}
            </p>
            <div className="mt-6 flex items-center gap-3">
              {t.image ? (
                <Image
                  src={t.image}
                  alt={t.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-buttonColor to-textColor text-sm font-bold text-black">
                  {initials(t.name)}
                </div>
              )}
              <div>
                <div className="font-semibold text-white">{t.name}</div>
                <div className="text-xs text-gray-400">
                  {t.role}
                  {t.company ? `, ${t.company}` : ""}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
