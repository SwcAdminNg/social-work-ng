// The content a service page is built from. Each service (Policy and
// Advocacy, Research and Evaluation) supplies one of these from its
// client handover; the components in this folder render it.

export type Strand = {
  id: string;
  title: string;
  // The one-line idea the strand opens with, then the explanation.
  statement: string;
  paragraphs: string[];
};

export type ServiceItem = {
  id: string;
  title: string;
  statement: string;
  text: string;
};

export type ServicePageContent = {
  // The route, e.g. "/policy-and-advocacy".
  path: string;
  opening: {
    eyebrow: string;
    title: string;
    tagline: string;
    image: string;
    imageWidth: number;
    imageHeight: number;
    imageAlt: string;
    imageNote: string;
  };
  approach: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    strands: Strand[];
  };
  services: {
    eyebrow: string;
    title: string;
    items: ServiceItem[];
    // How every assignment is framed, with the invitation to talk.
    scope: {
      title: string;
      paragraphs: string[];
      button: { label: string; href: string };
    };
  };
  enquiry: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    helpfulLead: string;
    helpful: string[];
    notice: string;
    form: {
      heading: string;
      replyNote: string;
      labels: {
        name: string;
        email: string;
        organisation: string;
        phone: string;
        message: string;
      };
      messagePrompt: string;
      button: string;
      // Used as the subject line of the enquiry that is sent.
      subject: string;
      privacy: { label: string; href: string };
    };
    confirmation: { title: string; text: string };
  };
};
