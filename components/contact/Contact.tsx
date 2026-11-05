import Image from "next/image";
import Link from "next/link";
import { ChevronRight, HelpCircle, Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "./ContactForm";
import TopicButton from "./TopicButton";
import s from "./Contact.module.css";

export default function Contact({ initialTopic }: { initialTopic?: string }) {
  return (
    <div className={s.page}>
      <section className={s.hero} aria-labelledby="contact-heading">
        <div className={s.heroCopy}>
          <h1 id="contact-heading">How can we help?</h1>
          <p className={s.heroLead}>
            Ask about courses, mentorship, learning support, or working with Social Work Consultancy
            Ltd. Choose the topic that best matches your enquiry and tell us how we can help.
          </p>
        </div>
        <div className={s.heroMedia}>
          <Image
            src="/images/contact/support-professional.webp"
            alt="A smiling support professional wearing a headset sits at a desk with a computer."
            fill
            priority
            sizes="(min-width: 900px) 48vw, 100vw"
          />
          <span className={s.chip}>Illustrative image</span>
        </div>
      </section>

      <div className={`${s.main} ${s.container}`}>
        <div className={s.grid}>
          {/* Contact details and quick links */}
          <aside className={`${s.card} ${s.areaDetails}`} aria-labelledby="details-heading">
            <h2 id="details-heading" className={s.cardTitle}>Contact SWCL</h2>
            <ul className={s.details}>
              <li>
                <a className={s.detail} href="mailto:support@socialworknigeria.org">
                  <span className={s.icon}><Mail size={20} aria-hidden="true" /></span>
                  <span>
                    <span className={s.detailLabel}>Email</span>
                    <span className={s.detailValue}>support@socialworknigeria.org</span>
                  </span>
                </a>
              </li>
              <li>
                <a className={s.detail} href="tel:+2348034471063">
                  <span className={s.icon}><Phone size={20} aria-hidden="true" /></span>
                  <span>
                    <span className={s.detailLabel}>Phone</span>
                    <span className={s.detailValue}>+234 803 447 1063</span>
                  </span>
                </a>
              </li>
              <li>
                <div className={s.detail}>
                  <span className={s.icon}><MapPin size={20} aria-hidden="true" /></span>
                  <span>
                    <span className={s.detailLabel}>Location</span>
                    <span className={s.detailValue}>Jos, Plateau State, Nigeria</span>
                  </span>
                </div>
              </li>
            </ul>
          </aside>

          {/* Quick links sit under the form on phones, under the details on desktop. */}
          <nav className={`${s.card} ${s.areaLinks}`} aria-labelledby="links-heading">
            <h2 id="links-heading" className={s.subTitle}>Useful links</h2>
            <ul className={s.links}>
              <li>
                <Link href="/courses" className={s.linkRow}>
                  <span>
                    Course enquiries
                    <span className={s.linkHint}>Browse courses and who they are for</span>
                  </span>
                  <ChevronRight size={18} aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link href="/mentorship" className={s.linkRow}>
                  <span>
                    Mentorship
                    <span className={s.linkHint}>How mentorship works</span>
                  </span>
                  <ChevronRight size={18} aria-hidden="true" />
                </Link>
              </li>
              <li>
                <TopicButton topic="account" className={s.linkRow}>
                  <span>
                    Account support
                    <span className={s.linkHint}>Start a support message below</span>
                  </span>
                  <ChevronRight size={18} aria-hidden="true" />
                </TopicButton>
              </li>
            </ul>
          </nav>

          {/* Enquiry form */}
          <section className={`${s.card} ${s.areaForm}`} aria-labelledby="form-heading" id="send-message" style={{ scrollMarginTop: 100 }}>
            <div className={s.formHeader}>
              <h2 id="form-heading" className={s.cardTitle}>Send us a message</h2>
              <p>Choose a topic, tell us what you need and we will reply by email.</p>
            </div>
            <ContactForm initialTopic={initialTopic} />
          </section>
        </div>

        <section className={s.faqBand} aria-labelledby="faq-heading">
          <div className={s.faqLead}>
            <span className={s.icon}><HelpCircle size={22} aria-hidden="true" /></span>
            <div>
              <h2 id="faq-heading">Looking for a quick answer?</h2>
              <p>Choosing a course, mentorship enquiries and account questions.</p>
            </div>
          </div>
          <Link href="/faq" className={s.faqButton}>
            View our FAQs <ChevronRight size={18} aria-hidden="true" />
          </Link>
        </section>
      </div>
    </div>
  );
}
