import Image from "next/image";
import Link from "next/link";
import s from "./Home.module.css";

const cx = (...names: string[]) => names.join(" ");

export default function Home() {
  return (
    <div className={s.page}>
      <section className={s.hero} aria-labelledby="hero-heading">
        <div className={s.heroContent}>
          <h1 id="hero-heading">Practical learning for social work in Nigeria and beyond</h1>
          <p>Develop your knowledge, skills and judgement to work with children, families and communities.</p>
          <div className={s.buttonGroup}>
            <Link className={cx(s.button, s.buttonGold)} href="/courses">Explore Courses</Link>
            <Link className={cx(s.button, s.buttonOutline)} href="/mentorship">Explore Mentorship</Link>
          </div>
        </div>
        <div className={s.heroImage}>
          <Image
            src="/images/home/elearning/hero-learners.webp"
            alt="Three adult learners work together with a laptop and notebooks in a bright library."
            fill
            priority
            sizes="(max-width: 760px) 100vw, 53vw"
          />
        </div>
      </section>

      <section className={cx(s.pathways, s.sectionPad)} aria-labelledby="pathways-heading">
        <div className={s.container}>
          <div className={s.sectionIntro}>
            <h2 id="pathways-heading">Professional learning from Social Work Consultancy Ltd</h2>
            <p>Accessible, practice-focused learning for social work and allied practice in Nigeria and beyond.</p>
          </div>
          <div className={s.pathwayGrid}>
            <article className={s.pathwayCard}>
              <svg className={s.lineIcon} viewBox="0 0 64 64" aria-hidden="true"><rect x="12" y="8" width="40" height="33" rx="3" /><path d="m12 41-7 13h54l-7-13M24 48h16" /></svg>
              <h3><Link href="/courses">Explore Courses</Link></h3>
              <p>Build practical knowledge and connect social work ideas with the responsibilities of your role.</p>
            </article>
            <article className={s.pathwayCard}>
              <svg className={s.lineIcon} viewBox="0 0 64 64" aria-hidden="true"><circle cx="24" cy="17" r="9" /><circle cx="46" cy="19" r="7" /><path d="M6 53V43c0-10 8-17 18-17s18 7 18 17v10M44 31c9 0 15 6 15 14v8" /></svg>
              <h3><Link href="/mentorship">Explore Mentorship</Link></h3>
              <p>Explore guidance, reflection and professional development through mentorship.</p>
            </article>
            <article className={s.pathwayCard}>
              <svg className={s.lineIcon} viewBox="0 0 64 64" aria-hidden="true"><path d="M32 15C23 8 12 7 5 9v43c9-3 19-1 27 5 8-6 18-8 27-5V9c-7-2-18-1-27 6Zm0 0v42" /></svg>
              <h3><Link href="/resources">Use Practice Resources</Link></h3>
              <p>Explore tools, guides and reading to support your learning and day-to-day practice.</p>
            </article>
          </div>
        </div>
      </section>

      <section className={cx(s.featuredSection, s.container)} aria-labelledby="featured-heading">
        <div className={cx(s.splitPanel, s.featuredPanel)}>
          <div className={s.panelCopy}>
            <p className={s.eyebrow}>Featured Course</p>
            <h2 id="featured-heading">Introduction to Social Work Practice</h2>
            <p>A practical introduction to core concepts, values and everyday practice in the Nigerian context.</p>
            {/* Point to the course detail URL once it is confirmed. */}
            <Link className={cx(s.button, s.buttonGreen)} href="/courses">View Course Overview</Link>
          </div>
          <div className={s.panelImage}>
            <Image
              src="/images/home/elearning/featured-course.webp"
              alt="An adult learner writes in a notebook during a class."
              fill
              sizes="(max-width: 760px) 100vw, 42vw"
            />
          </div>
        </div>
      </section>

      <section className={cx(s.practiceSection, s.container)} aria-labelledby="practice-heading">
        <div className={s.practiceIcon} aria-hidden="true">
          <svg className={s.lineIcon} viewBox="0 0 64 64"><circle cx="32" cy="12" r="8" /><circle cx="13" cy="29" r="7" /><circle cx="51" cy="29" r="7" /><path d="M18 61v-9c0-8 6-14 14-14s14 6 14 14v9M3 57V46c0-6 4-10 10-10h5M61 57V46c0-6-4-10-10-10h-5" /></svg>
        </div>
        <div className={s.practiceText}>
          <h2 id="practice-heading">Apply what you learn</h2>
          <p>Practice scenario. A family faces concerns about a child’s welfare and financial stress, while local services are limited. How would you assess their needs, prioritise support and work with the family and community to identify realistic next steps?</p>
        </div>
      </section>

      <section className={s.teamSection} aria-labelledby="team-heading">
        <div className={cx(s.splitPanel, s.teamPanel, s.container)}>
          <div className={s.panelCopy}>
            <h2 id="team-heading">Develop learning for your team</h2>
            <p>Discuss professional learning that responds to your team’s roles, practice challenges and development goals.</p>
            <Link className={cx(s.button, s.buttonGreen)} href="/contact">Discuss Training or Partnership</Link>
          </div>
          <div className={s.panelImage}>
            <Image
              src="/images/home/elearning/team-training.webp"
              alt="Three professionals discuss learning and practice together."
              fill
              sizes="(max-width: 760px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className={s.closingCta} aria-labelledby="closing-heading">
        <div className={s.container}>
          <h2 id="closing-heading">Choose a course that fits your goals</h2>
          <p>Find practical, relevant learning to strengthen your social work knowledge and practice.</p>
          <div className={s.buttonGroup}>
            <Link className={cx(s.button, s.buttonGold)} href="/courses">Explore Courses</Link>
            <Link className={cx(s.button, s.buttonOutline)} href="/contact">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
