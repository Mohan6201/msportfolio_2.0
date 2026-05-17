"use client";
import { motion } from "framer-motion";
import { HiOutlineMail } from "react-icons/hi";
import { FiPhone, FiGithub, FiLinkedin } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
import ContactForm from "./ContactForm";

const INFO = [
  { Icon: HiOutlineMail, label: "Email",    value: "mohandevopssme@gmail.com", href: "mailto:mohandevopssme@gmail.com" },
  { Icon: FiPhone,       label: "Phone",    value: "+91 80988 85683",           href: "tel:+918098885683" },
  { Icon: IoLocationOutline, label: "Location", value: "Hyderabad, India",      href: "#" },
];

const SOCIALS = [
  { Icon: FiGithub,   href: "https://github.com/Mohan6201",             label: "GitHub",   color: "text-white hover:text-cyan" },
  { Icon: FiLinkedin, href: "https://www.linkedin.com/in/mohan6201",     label: "LinkedIn", color: "text-white hover:text-cyan" },
  { Icon: HiOutlineMail, href: "mailto:mohandevopssme@gmail.com",        label: "Email",    color: "text-white hover:text-orange" },
];

export default function ContactMeMain() {
  return (
    <section id="contact" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          className="mb-14"
        >
          <p className="section-tag mb-4">Get In Touch</p>
          <h2 className="font-special text-3xl sm:text-4xl font-bold text-white">
            Let&apos;s <span className="gradient-text">connect</span>
          </h2>
          <p className="text-lightGrey mt-3 max-w-xl">
            Open to DevOps opportunities, consulting, or just a good conversation about cloud architecture.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-10">
          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6"
          >
            <div className="terminal">
              <div className="terminal-bar gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-orange/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-green/70" />
                <span className="font-mono text-xs text-lightGrey/50 ml-2">contact.sh</span>
              </div>
              <div className="terminal-body">
                <p className="terminal-prompt mb-1">$ ping mohana</p>
                <p className="terminal-output">PING successful — I reply within 24 hours</p>
                <p className="terminal-prompt mt-3 mb-1">$ cat contact.json</p>
                {INFO.map(({ Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-2 mt-1">
                    <span className="text-cyan/60 font-mono">&quot;{label}&quot;:</span>
                    <a href={href} className="text-lightGrey hover:text-cyan transition-colors font-mono text-sm">
                      &quot;{value}&quot;
                    </a>
                  </div>
                ))}
                <p className="terminal-prompt mt-3">$ <span className="terminal-cursor" /></p>
              </div>
            </div>

            {/* Social links */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <p className="text-xs font-mono text-lightGrey/50 uppercase tracking-widest mb-4">Find me on</p>
              <div className="flex gap-3">
                {SOCIALS.map(({ Icon, href, label, color }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    aria-label={label}
                    className={`w-10 h-10 rounded-xl glass border border-white/8 flex items-center justify-center transition-all duration-200 hover:border-cyan/30 hover:-translate-y-1 ${color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Available badge */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green/6 border border-green/15">
              <div className="status-dot" />
              <div>
                <p className="text-green text-sm font-semibold">Available for opportunities</p>
                <p className="text-lightGrey text-xs font-mono">Response time: &lt; 24 hours</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-2xl p-6 border border-white/5"
          >
            <h3 className="text-white font-special font-semibold text-lg mb-6">Send a Message</h3>
            <ContactForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
