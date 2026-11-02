import type { EnquiryFormConfig } from "@/components/shared/EnquiryForm";

// Copy for the Contact page. Contact details match the shared footer.

export const opening = {
  eyebrow: "Contact us",
  title: "Get in Touch",
  tagline:
    "Whether you have a question about our courses, need support with your mentorship journey, or want to explore partnership opportunities, our team is ready to help.",
};

export const reach = {
  eyebrow: "How to reach us",
  title: "We’d Love to Hear from You",
  paragraphs: [
    "Tell us what you need and the best way to reach you. We reply by email, or by telephone if you give us a number.",
    "Please avoid including confidential case details or sensitive personal information in your first message.",
  ],
  details: {
    organisation: "Social Work Consultancy Ltd",
    address: "Flat C3, Okonkwo Estate, Jos, Plateau State, Nigeria",
    phone: "+234 806 404 7702",
    email: "support@socialworknigeria.org",
  },
};

export const form: EnquiryFormConfig = {
  heading: "Send us a message",
  replyNote: "We reply by email, or by telephone if you give us a number.",
  subjectLabel: "Subject",
  defaultSubject: "Website enquiry",
  messageLabel: "Your message",
  messagePrompt: "Tell us what you need and any timescale you have in mind.",
  button: "Send Message",
  category: "general",
  sourcePage: "/contact",
  confirmation: {
    title: "Thank you. Your message has been sent.",
    text: "We will read it and get back to you by email, or by telephone if you gave us a number.",
  },
};

export const location = {
  eyebrow: "Where we are",
  title: "Find Us in Jos",
  text: "Our office is in Jos, Plateau State. If you are planning a visit, please get in touch first so we can make sure someone is available to see you.",
  mapSrc: "https://maps.google.com/maps?cid=11551025152218255818&output=embed",
};
