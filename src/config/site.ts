/**
 * Site configuration - edit strings and beta code here.
 * Changes apply across the app. Restart dev server after editing.
 */

// ─── App identity ───────────────────────────────────────────────────────────
export const APP_NAME = "Romeo & Juliet";
export const APP_TAGLINE = "Begin with a conversation. We'll curate the introductions.";
export const APP_DESCRIPTION = "Find your destiny: matchmaking with Voice AI";

// ─── Beta gate ───────────────────────────────────────────────────────────────
/** Set to false to bypass the beta invite-code gate entirely. */
export const BETA_GATE_ENABLED = false;

/** 5-letter invite code. Override with NEXT_PUBLIC_BETA_CODE in .env.local */
export const BETA_CODE_DEFAULT = "romeo";
export const BETA_STORAGE_KEY = "beta_verified";
export const BETA_CODE_LENGTH = 5;

export function getBetaCode(): string {
  const env = process.env.NEXT_PUBLIC_BETA_CODE?.trim().toLowerCase();
  return (env || BETA_CODE_DEFAULT).slice(0, BETA_CODE_LENGTH);
}

// ─── Landing page ───────────────────────────────────────────────────────────
export const LANDING = {
  title: APP_NAME,
  titleLine1: "Romeo &",
  titleLine2: "Juliet",
  tagline: APP_TAGLINE,
  emailPlaceholder: "Enter your email and we'll send you a link to login.",
  emailLabel: "Email Address",
  buttonSend: "Begin Your Introduction",
  buttonSending: "Sending…",
  messageSuccess: "Check your email for the sign-in link. Click it to continue.",
  messageError: "Something went wrong.",
  followInsta: "Follow us on Instagram",
  instagramUrl: "https://www.instagram.com/romeojuliet.love",
};

// ─── Beta page ───────────────────────────────────────────────────────────────
export const BETA = {
  title: APP_NAME,
  subtitle: "We're in beta. Enter your invite code to continue.",
  placeholder: "Enter 5-letter code",
  label: "Beta invite code",
  errorWrongLength: "Please enter a 5-letter code.",
  errorInvalidCode: "Invalid code. Please try again.",
  buttonContinue: "Continue",
  buttonEntering: "Entering…",
  loading: "Loading…",
};

// ─── Auth callback ───────────────────────────────────────────────────────────
export const AUTH = {
  signingIn: "Signing you in…",
  signInFailed: "Sign-in failed. Please try again.",
  backToLogin: "Back to login",
};

// ─── Membership access gate ─────────────────────────────────────────────────
export const MEMBERSHIP_STORAGE_KEY = "membership_access_verified";
export const MEMBERSHIP_APPLICATION_STORAGE_KEY = "membership_apply_submission";
export const MEMBERSHIP_REFERRAL_CODE = "VRJ501";
export const MEMBERSHIP_CODE_LENGTH = MEMBERSHIP_REFERRAL_CODE.length;

export function getMembershipReferralCode(): string {
  const env = process.env.NEXT_PUBLIC_MEMBERSHIP_CODE?.trim().toUpperCase();
  return (env || MEMBERSHIP_REFERRAL_CODE).slice(0, MEMBERSHIP_CODE_LENGTH);
}

export const MEMBERSHIP = {
  pageTitle: "Membership Access",
  label: "Enter referral code",
  continueButton: "Continue",
  continueButtonLoading: "Checking...",
  errorInvalidCode: "Invalid referral code. Please try again.",
  noCode: "Don't have a code?",
  noCodeHint: "You can still apply, we review every request carefully.",
  applyButton: "Apply for access",
  applyPageTitle: "Apply for access",
  applyFields: {
    fullName: "Full Name",
    age: "Age",
    gender: "Gender",
    publicProfileLink: "Public Profile Link",
  },
  applySubmit: "Submit",
  applySubmitLoading: "Submitting...",
  applyErrors: {
    fullName: "Please enter your full name.",
    age: "Please enter a valid age (18+).",
    gender: "Please select your gender.",
    publicProfileLink: "Please enter a valid public profile link.",
  },
  confirmationTitle: "We'll come back to you",
  confirmationMessage:
    "We will go through your details and get back to you shortly. If approved, your access code will be shared via email.",
  confirmationContinue: "Continue",
};

// ─── Home (post-onboarding) ──────────────────────────────────────────────────
export const HOME = {
  title: APP_NAME,
  loading: "Loading…",
  underConsideration:
    "Your profile is now under consideration. We'll notify you when we've identified a meaningful introduction.",
  underConsiderationPersonalized: (firstName: string) =>
    `${firstName}, your profile is now under consideration. We'll notify you when we've identified a meaningful introduction.`,
  timelineHint: "We typically review profiles within 2–3 days.",
  editProfile: "Edit your profile",
  howWeMatch: "How we match",
  howWeMatchContent: `Our team personally reviews each profile and uses Romeo our matchmaking AI agent to analyse your conversation with Juliet to identify people who share your values and what you're looking for. When we find a meaningful connection, we'll introduce you.`,
  followInsta: "Follow us on Instagram",
  instagramUrl: "https://www.instagram.com/romeojuliet.love",
  logOut: "Log out",
};

// ─── Voice (Juliet conversation) ─────────────────────────────────────────────
export const JULIET_NAME = "Juliet";

export const VOICE = {
  title: APP_NAME,
  introHeading: `I'm ${JULIET_NAME}`,
  introDescription:
    "Your words are how we get to know you. Juliet will ask you a few questions and our AI uses your answers to find someone genuinely compatible. Far beyond what a form could capture. Find a quiet space and speak openly.",
  buttonContinue: "Begin",
  julietPrefix: `${JULIET_NAME}: `,
  whyWeAskPrefix: "Why we ask: ",
  statusSaving: "Saving...",
  statusSpeaking: `${JULIET_NAME} is speaking...`,
  statusListening: "Listening... Tap again when done",
  statusListeningActive: "Juliet is listening",
  statusTranscribing: "Transcribing...",
  statusPressToSpeak: "Press to start speaking",
  ariaTapWhenDone: "Tap when done speaking",
  ariaPressToSpeak: "Press to start speaking",
  hintMicPressToSpeak: "Mic · Press to start speaking",
  hintPressAgainWhenDone: "Press again when done",
  errorPlayAudio: "Could not play audio.",
  errorAnswerRequired: "Please answer the question before continuing.",
  errorSessionExpired: "Session expired. Please sign in again.",
  errorSaveSummary: "Could not save summary.",
  errorTranscribe: "Something went wrong while transcribing.",
  errorNoAudio: "I couldn't hear anything. Please try again.",
  errorMicrophone: "Microphone access denied or unavailable.",
  reRecordLabel: "Talk to Juliet again",
};

export const JULIET_INTRO = {
  line1: `Hi, I'm ${JULIET_NAME}.`,
  line2:
    "Your responses here are completely private. Answer thoughtfully and in your own words. Let's begin.",
};

export const VOICE_QUESTIONS = [
  {
    question:
      "When you start to feel distance from someone you care about, what do you usually notice in yourself?",
    whyWeAsk: "How we respond to distance often shapes the direction of a relationship.",
  },
  {
    question: "Looking back, what patterns have you noticed in your relationships?",
    whyWeAsk: "Patterns tell us more than intentions do.",
  },
  {
    question: "Think of a disagreement that stands out to you. What happened?",
    whyWeAsk: "The way we move through tension says a lot about compatibility.",
  },
  {
    question: "What helps you feel close to someone?",
    whyWeAsk: "Closeness means different things to different people.",
  },
  {
    question:
      "If your love life unfolded in a way that felt right to you over the next few years, what would it look like?",
    whyWeAsk: "Shared direction tends to matter as much as shared chemistry.",
  },
  {
    question: "When you've had a long or stressful week, what do you usually gravitate toward?",
    whyWeAsk: "Everyday rhythm plays a bigger role in relationships than people expect.",
  },
  {
    question: "How do you tend to experience physical affection in relationships?",
    whyWeAsk: "People vary widely in how they express and receive intimacy.",
  },
];

// ─── Photo guidance (onboarding step 3) ──────────────────────────────────────
export const PHOTO_GUIDANCE = {
  photo1: {
    title: "Photo 1: A moment that feels like me",
    bullets: [
      "Upload a clear photo of yourself where your face is easily recognisable.",
      "Please use a recent, natural photo.",
      "Avoid filters, facetune, or edited images. Our AI will filter out non-natural pictures.",
    ],
  },
  photo2: {
    title: "Photo 2: Doing something I'd love to share with someone",
    bullets: [
      "Upload a photo of yourself doing something you genuinely enjoy.",
      "This could be a hobby, activity, or everyday moment you'd enjoy sharing with a partner.",
    ],
  },
  photo3: {
    title: "Photo 3: With people or in a place that shaped me",
    bullets: [
      "Upload a photo with people or in a place that matters to you.",
      "You don't need to be alone in the photo, but you should still be identifiable.",
    ],
  },
  footer: "Natural photos work best. Perfection isn't expected.",
  buttonContinue: "Continue",
};

// ─── Privacy page ────────────────────────────────────────────────────────────
export const PRIVACY = {
  pageTitle: "Privacy Policy",
  lastUpdated: "Last updated: 2025",
  intro: "Romeo & Juliet Ltd respects your privacy and processes personal data in accordance with UK GDPR and applicable data protection laws.",

  sections: {
    informationWeCollect: {
      title: "Information We Collect",
      content: [
        "We collect information you provide including name, age, gender, photographs, profile details, messages, payment information, and communications with support.",
        "We automatically collect device information, IP address, usage activity, and interaction data to improve safety and performance.",
      ],
    },

    howWeUseData: {
      title: "How We Use Data",
      content: [
        "We use your data to provide matchmaking services, operate accounts, process payments, prevent fraud, improve services, and comply with legal obligations.",
        "Legal bases for processing include performance of contract, legitimate interests, consent, and legal compliance.",
      ],
    },

    dataSharing: {
      title: "Data Sharing",
      content: [
        "Your data may be shared with payment processors, hosting providers, moderation tools, analytics providers, and law enforcement where required.",
      ],
    },

    dataRetention: {
      title: "Data Retention",
      content: [
        "We retain personal data only as long as necessary to provide services or meet legal obligations.",
      ],
    },

    yourRights: {
      title: "Your Rights",
      content: [
        "You have rights to access, correct, delete, restrict, or transfer your personal data and to withdraw consent.",
        "Requests may be sent to contact@romeojuliet.love.",
      ],
    },

    security: {
      title: "Security",
      content: [
        "We implement encryption, access controls, and monitoring systems to protect user data.",
      ],
    },

    internationalTransfers: {
      title: "International Transfers",
      content: [
        "International transfers are safeguarded using approved legal mechanisms.",
      ],
    },

    communityGuidelines: {
      title: "Community Guidelines",
      content: [
        "Romeo & Juliet aims to create a respectful matchmaking environment.",
        "Users must treat others with respect and honesty.",
        "Prohibited behaviour includes harassment, hate speech, discrimination, threats, sexual exploitation, impersonation, scams, solicitation for money, or sharing private information without consent.",
        "Fake profiles and misleading information are strictly prohibited.",
        "Users should communicate respectfully and report suspicious behaviour immediately.",
        "Violations may result in warnings, suspension, or permanent bans.",
      ],
    },

    safetyPolicy: {
      title: "Safety Policy",
      content: [
        "User safety is a priority.",
        "Users should avoid sharing financial information, home addresses, or sensitive personal data.",
        "Meet new people in public locations and inform a trusted person before meetings.",
        "Romeo & Juliet encourages users to use in-app messaging before sharing external contact details.",
        "We may use moderation tools, automated detection systems, and manual review to identify harmful behaviour.",
        "Emergency concerns should always be reported to local authorities first.",
      ],
    },

    cookiePolicy: {
      title: "Cookie Policy",
      content: [
        "Romeo & Juliet uses cookies and similar technologies to operate and improve the Service.",
        "Cookies allow account authentication, performance monitoring, analytics measurement, and preference storage.",
        "Types of cookies include essential cookies, performance cookies, functionality cookies, and analytics cookies.",
        "Users may manage cookie preferences through device or browser settings. Disabling cookies may affect functionality.",
        "Continued use of the Service constitutes consent to cookie usage.",
      ],
    },

    reportingAndBlocking: {
      title: "Reporting and Blocking",
      content: [
        "Users may report profiles, messages, or behaviour directly within the App.",
        "Reports may include harassment, fake accounts, fraud attempts, inappropriate content, or safety concerns.",
        "Reported accounts are reviewed by moderation teams and may result in warnings, restrictions, suspension, or permanent removal.",
        "Users may block other users at any time. Blocked users cannot view profiles or initiate communication.",
        "Repeated or malicious false reporting may result in account action.",
        "Romeo & Juliet cooperates with law enforcement where legally required.",
      ],
    },
  },
};

// ─── Contact page ────────────────────────────────────────────────────────────
export const CONTACT = {
  pageTitle: "Contact Us",
  subtitle: "We're here to help",

  sections: {
    generalSupport: {
      title: "General Support",
      content: [
        "Need help with your account, matches, or subscriptions? Our support team is available to assist you.",
      ],
      email: "product@romeojuliet.com",
    },

    careersPartnerships: {
      title: "Careers & Partnerships",
      content: [
        "Interested in becoming a campus ambassador or partnering with Romeo & Juliet? We'd love to hear from you.",
      ],
      email: "product@romeojuliet.com",
    },

    privacyRequests: {
      title: "Privacy Requests",
      content: [
        "For GDPR requests including data access, correction, or deletion, please contact our privacy team.",
      ],
      email: "product@romeojuliet.com",
    },

    responseTime: {
      title: "Response Time",
      content: [
        "We typically respond within 24–48 hours on business days. For urgent safety concerns, please contact local authorities first.",
      ],
    },

    philosophy: {
      title: "Our Philosophy",
      content: [
        "In Shakespeare's story, Romeo met Juliet by chance.\nIn ours, they meet through understanding.\nJuliet listens.\nRomeo matches.\nYou connect.\nWelcome to the future of love.",
      ],
      footer: "The Romeo & Juliet Team",
    },
  },
};

// ─── Terms page ──────────────────────────────────────────────────────────────
export const TERMS = {
  pageTitle: "Terms and Conditions",
  lastUpdated: "Last updated: 2025",
  intro: "These Terms and Conditions govern your access to and use of the Romeo & Juliet mobile application, website, and related services (\"Service\"). By creating an account or using the Service, you agree to be legally bound by these Terms. If you do not agree, you must not use the Service.",

  sections: {
    definitions: {
      title: "Definitions",
      content: [
        "\"Romeo & Juliet\", \"Company\", \"we\", \"us\", or \"our\" refers to Romeo & Juliet Ltd.",
        "\"User\" or \"you\" refers to any person accessing or using the Service.",
        "\"Content\" includes profiles, photographs, messages, videos, text, or other materials uploaded to the Service.",
        "\"Premium Services\" refers to paid features or subscriptions.",
      ],
    },

    eligibility: {
      title: "Eligibility",
      content: [
        "You must be at least 18 years old to use the Service. By registering, you confirm that you have legal capacity to enter a binding agreement and that all information provided is accurate. Romeo & Juliet may request age or identity verification at any time.",
      ],
    },

    accountRegistration: {
      title: "Account Registration",
      content: [
        "Only one account per individual is permitted. You are responsible for maintaining confidentiality of login credentials and for all activity under your account. Accounts may not be sold, transferred, or shared.",
      ],
    },

    natureOfService: {
      title: "Nature of the Service",
      content: [
        "Romeo & Juliet provides matchmaking and social introduction services only. We do not guarantee compatibility, communication, meetings, or relationship success. Users interact at their own risk.",
      ],
    },

    acceptableUse: {
      title: "Acceptable Use",
      content: [
        "Users must not harass, threaten, impersonate others, promote scams, request money, upload unlawful content, distribute hate speech, or use automated systems or bots. We may remove content or terminate accounts without notice.",
      ],
    },

    offlineInteractions: {
      title: "Offline Interactions",
      content: [
        "Romeo & Juliet is not responsible for the conduct of users during offline meetings or communications outside the Service. Users assume all risks when interacting with others.",
      ],
    },

    userContent: {
      title: "User Content",
      content: [
        "You retain ownership of your content but grant Romeo & Juliet a worldwide, royalty-free licence to host, display, reproduce, and distribute such content for operation and promotion of the Service. You confirm you have rights to all uploaded material.",
      ],
    },

    moderation: {
      title: "Moderation",
      content: [
        "We may monitor activity, remove content, restrict visibility, suspend, or permanently terminate accounts at our discretion to maintain community safety",
      ],
    },

    freeTrial: {
      title: "Free Trial",
      content: [
        "Romeo & Juliet may offer a free trial period for Premium Services. Trial duration will be disclosed before activation. Payment details may be required prior to trial commencement. Unless cancelled before the trial ends, your subscription automatically converts into a paid weekly subscription charged at £[amount] per week using your selected payment method. Billing renews weekly until cancelled. You expressly authorise recurring payments by activating the trial. Subscriptions may be cancelled through account settings or via Apple App Store or Google Play subscriptions. Payments already processed are non-refundable except where required by law.",
      ],
    },

    payments: {
      title: "Payments",
      content: [
        "You authorise Romeo & Juliet and its payment processors to charge all applicable fees. Failure of payment may result in suspension or termination of access.",
      ],
    },

    noBackgroundChecks: {
      title: "No Background Checks",
      content: [
        "Romeo & Juliet does not routinely conduct criminal background checks. Users are responsible for exercising personal caution.",
      ],
    },

    intellectualProperty: {
      title: "Intellectual Property",
      content: [
        "All software, branding, design, algorithms, databases, and platform functionality remain the exclusive property of Romeo & Juliet Ltd.",
      ],
    },

    privacy: {
      title: "Privacy",
      content: [
        "Personal data is processed in accordance with our Privacy Policy and applicable data protection laws including UK GDPR.",
      ],
    },

    accountTermination: {
      title: "Account Termination",
      content: [
        "We may suspend or terminate accounts for breaches of these Terms, safety concerns, fraudulent activity, or legal requirements. Users may delete accounts at any time.",
      ],
    },

    disclaimer: {
      title: "Disclaimer",
      content: [
        "The Service is provided \"as is\" without warranties of availability, accuracy, compatibility, or relationship outcomes.",
      ],
    },

    limitationOfLiability: {
      title: "Limitation of Liability",
      content: [
        "To the fullest extent permitted by law, Romeo & Juliet shall not be liable for indirect or consequential damages, emotional distress, user conduct, or loss arising from use of the Service. Liability shall not exceed fees paid within the previous 12 months.",
      ],
    },

    indemnification: {
      title: "Indemnification",
      content: [
        "You agree to indemnify Romeo & Juliet against claims arising from your conduct, content, or breach of these Terms.",
      ],
    },

    thirdPartyServices: {
      title: "Third-Party Services",
      content: [
        "Romeo & Juliet is not responsible for third-party platforms or payment providers integrated into the Service.",
      ],
    },

    governingLaw: {
      title: "Governing Law",
      content: [
        "These Terms are governed by the laws of England and Wales.",
      ],
    },

    changesToTerms: {
      title: "Changes to Terms",
      content: [
        "We may modify these Terms at any time. Continued use constitutes acceptance of updated Terms.",
      ],
    },

    contact: {
      title: "Contact",
      content: [
        "Romeo & Juliet Ltd",
        "contact@romeojuliet.love",
      ],
    },
  },
};

// ─── Onboarding Step 2 (Basic Information) ───────────────────────────────────
export const ONBOARDING_STEP_2 = {
  pageTitle: "Basic Information",
  loading: "Loading…",
  buttonContinue: "Continue",
  buttonSaving: "Saving…",
  backLabel: "Back",

  fields: {
    name: {
      label: "Name",
      placeholder: "E.g. Juliet",
    },
    dateOfBirth: {
      label: "Date of Birth",
    },
    ageRange: {
      heading: "Age range you'd like to date",
      minLabel: "Min Age",
      maxLabel: "Max Age",
      selectPlaceholder: "Select",
    },
    gender: {
      heading: "Gender",
      options: [
        { value: "woman", label: "Woman" },
        { value: "man", label: "Man" },
        { value: "nonbinary", label: "Non-binary" },
      ],
    },
    lookingFor: {
      heading: "Who would you like to meet?",
      options: [
        { value: "women", label: "Women" },
        { value: "men", label: "Men" },
        { value: "everyone", label: "Everyone" },
      ],
    },
    pronouns: {
      heading: "Pronouns",
      options: [
        { value: "she/her", label: "She/Her" },
        { value: "he/him", label: "He/Him" },
        { value: "they/them", label: "They/Them" },
      ],
    },
  },

  errors: {
    signedIn: "You must be signed in.",
    name: "Please enter your name.",
    dateOfBirth: "Please enter your date of birth.",
    ageRange: "Please select your preferred age range.",
    ageRangeInvalid: "Please enter a valid age range.",
    gender: "Please select your gender.",
    lookingFor: "Please select who you'd like to meet.",
    pronouns: "Please select your pronouns.",
    saveFailed: "Failed to save data",
    unknown: "Something went wrong.",
  },

  api: {
    sectionName: "basic_info",
    successLog: "Data saved successfully:",
    errorLog: "Error saving data:",
  },
};

// ─── Onboarding Step 2 Sections ──────────────────────────────────────────────
export const ONBOARDING_STEP_2_SECTIONS = {
  locAndFuture: {
    pageTitle: "Location & Future Plans",
    loading: "Loading…",
    buttonContinue: "Continue",
    buttonSaving: "Saving…",
    errors: {
      signedIn: "You must be signed in.",
      whereBased: "Please enter where you are currently based.",
      plansToStay: "Please select whether you see yourself living here in the next few years.",
      relocating: "Please select whether you would consider relocating for the right relationship.",
      futureLocation: "Please enter where you imagine living in the future.",
      saveFailed: "Failed to save data",
      unknown: "Something went wrong.",
    },
    fields: {
      whereBased: {
        label: "Where are you currently based?",
        placeholder: "E.g. New York, NY",
      },
      plansToStay: {
        heading: "Do you see yourself living here over the next few years?",
        options: [
          { value: "settled_here", label: "Yes, I'm settled here" },
          { value: "likely_open_to_change", label: "Likely, but open to change" },
          { value: "unsure", label: "Unsure" },
          { value: "planning_to_move", label: "Planning to move" },
          { value: "prefer_not_to_say", label: "Prefer not to say" },
        ],
      },
      relocating: {
        heading: "Would you consider relocating for the right relationship?",
        options: [
          { value: "yes", label: "Yes" },
          { value: "possibly", label: "Possibly" },
          { value: "unlikely", label: "Unlikely" },
          { value: "no", label: "No" },
          { value: "unsure", label: "Unsure" },
        ],
      },
      futureLocation: {
        label: "Is there somewhere you imagine living in the future?",
        placeholder: "E.g. Somewhere by the ocean",
      },
    },
    api: {
      sectionName: "location_future",
      successLog: "Data saved successfully:",
      errorLog: "Error saving data:",
    },
  },

  work: {
    pageTitle: "Work & Life Stage",
    loading: "Loading…",
    buttonContinue: "Continue",
    buttonSaving: "Saving…",
    errors: {
      signedIn: "You must be signed in.",
      workType: "Please enter what kind of work you currently do.",
      workSituation: "Please select your current work situation.",
      financialLifestyle: "Please select your current financial lifestyle.",
      weeklySchedule: "Please select your typical weekly schedule.",
      saveFailed: "Failed to save data",
      unknown: "Something went wrong.",
    },
    fields: {
      workType: {
        label: "What kind of work do you currently do?",
        placeholder: "E.g. Software Engineer, Artist, Student",
      },
      workSituation: {
        heading: "Current work situation",
        options: [
          { value: "employed_fulltime", label: "Employed full-time" },
          { value: "self_employed", label: "Self-employed / founder" },
          { value: "in_education", label: "In education or training" },
          { value: "between_roles", label: "Between roles" },
          { value: "exploring", label: "Exploring / transitioning" },
        ],
      },
      financialLifestyle: {
        heading: "How would you describe your current financial lifestyle?",
        options: [
          { value: "comfortable_stable", label: "Comfortable and stable" },
          { value: "doing_well", label: "Doing well professionally" },
          { value: "building_stability", label: "Building toward stability" },
          { value: "prefer_not_say", label: "Prefer not to say" },
        ],
      },
      weeklySchedule: {
        heading: "Which best describes your typical weekly schedule?",
        options: [
          { value: "predictable_routine", label: "Mostly predictable routine" },
          { value: "busy_flexible", label: "Busy but flexible" },
          { value: "frequently_changing", label: "Frequently changing schedule" },
          { value: "travel_heavy", label: "Travel-heavy" },
          { value: "limited_evenings_weekends", label: "Evenings or weekends often limited" },
        ],
      },
    },
    api: {
      sectionName: "work",
      successLog: "Data saved successfully:",
      errorLog: "Error saving data:",
    },
  },

  education: {
    pageTitle: "Education and Intellectual Life",
    loading: "Loading…",
    buttonContinue: "Continue",
    buttonSaving: "Saving…",
    errors: {
      signedIn: "You must be signed in.",
      educationalBackground: "Please select your educational background.",
      intellectualMatchImportance: "Please select how important intellectual compatibility is to you.",
      saveFailed: "Failed to save data",
      unknown: "Something went wrong.",
    },
    fields: {
      educationalBackground: {
        heading: "Educational background",
        options: [
          { value: "secondary_school", label: "Secondary school / equivalent" },
          { value: "vocational_technical", label: "Vocational or technical training" },
          { value: "undergraduate_degree", label: "Undergraduate degree" },
          { value: "postgraduate_degree", label: "Postgraduate degree" },
          { value: "doctorate_professional", label: "Doctorate / professional degree" },
          { value: "different_path", label: "Education has followed a different path" },
          { value: "prefer_not_say", label: "Prefer not to say" },
        ],
      },
      intellectualMatchImportance: {
        heading: "How important is it to you to share a similar educational or intellectual background?",
        options: [
          { value: "important", label: "Important" },
          { value: "somewhat_important", label: "Somewhat important" },
          { value: "not_especially_important", label: "Not especially important" },
          { value: "open_to_differences", label: "Open to differences" },
        ],
      },
    },
    api: {
      sectionName: "education_and_intellectual_life",
      successLog: "Data saved successfully:",
      errorLog: "Error saving data:",
    },
  },

  relationship: {
    pageTitle: "Relationship Goals",
    loading: "Loading…",
    buttonContinue: "Continue",
    buttonSaving: "Saving…",
    errors: {
      signedIn: "You must be signed in.",
      buildingToward: "Please select what you are intentionally building toward.",
      structure: "Please select the relationship structure you are looking for.",
      space: "Please select how much space you currently have for a relationship.",
      emotionalAvailability: "Please select your emotional availability.",
      lastRelationship: "Please select when your last serious relationship was.",
      pace: "Please select the pace that feels comfortable to you.",
      saveFailed: "Failed to save data",
      unknown: "Something went wrong.",
    },
    fields: {
      buildingToward: {
        heading: "What are you intentionally building toward right now?",
        options: [
          { value: "marriage", label: "Marriage" },
          { value: "long_term_partnership", label: "Long-term partnership" },
          { value: "committed_relationship", label: "A committed relationship" },
          { value: "figuring_it_out", label: "Still figuring it out" },
        ],
      },
      structure: {
        heading: "What kind of relationship structure are you looking for?",
        options: [
          { value: "monogamous", label: "Monogamous" },
          { value: "ethically_non_monogamous", label: "Ethically non-monogamous" },
          { value: "open_to_discussion", label: "Open to discussion" },
          { value: "unsure", label: "Unsure" },
          { value: "prefer_not_say", label: "Prefer not to say" },
        ],
      },
      space: {
        heading: "How much space do you currently have in your life for a relationship?",
        options: [
          { value: "clear_priority", label: "A relationship is a clear priority" },
          { value: "balancing_commitments", label: "Open but balancing other commitments" },
          { value: "casual_connections", label: "Exploring connections casually" },
          { value: "unsure", label: "Unsure" },
        ],
      },
      emotionalAvailability: {
        heading: "How emotionally available do you feel for a relationship right now?",
        options: [
          { value: "very_ready", label: "Very ready" },
          { value: "mostly_ready", label: "Mostly ready" },
          { value: "taking_slowly", label: "Open but taking things slowly" },
          { value: "unsure", label: "Unsure" },
        ],
      },
      lastRelationship: {
        heading: "How long has it been since your last serious relationship?",
        options: [
          { value: "currently_ending", label: "Currently ending one" },
          { value: "past_year", label: "Within the past year" },
          { value: "1_3_years", label: "1-3 years ago" },
          { value: "longer_ago", label: "Longer ago" },
          { value: "prefer_not_say", label: "Prefer not to say" },
        ],
      },
      pace: {
        heading: "When relationships develop, what pace usually feels comfortable to you?",
        options: [
          { value: "slowly", label: "Slowly over time" },
          { value: "steady_natural", label: "A steady, natural pace" },
          { value: "fairly_quickly", label: "Fairly quickly when it feels right" },
        ],
      },
    },
    api: {
      sectionName: "relationship",
      successLog: "Data saved successfully:",
      errorLog: "Error saving data:",
    },
  },

  family: {
    pageTitle: "Family & Children",
    loading: "Loading…",
    buttonContinue: "Continue",
    buttonSaving: "Saving…",
    errors: {
      signedIn: "You must be signed in.",
      currentChildren: "Please select whether you currently have children.",
      desireForChildren: "Please select how you feel about having (more) children.",
      datingWithChildren: "Please select how you feel about dating someone who has children.",
      saveFailed: "Failed to save data",
      unknown: "Something went wrong.",
    },
    fields: {
      currentChildren: {
        heading: "Do you currently have children?",
        options: [
          { value: "no", label: "No" },
          { value: "yes_fulltime", label: "Yes, full-time" },
          { value: "yes_parttime", label: "Yes, part-time" },
          { value: "yes_grown", label: "Yes, grown / independent" },
          { value: "prefer_not_say", label: "Prefer not to say" },
        ],
      },
      desireForChildren: {
        heading: "How do you feel about having (more) children?",
        options: [
          { value: "would_like", label: "I would like children" },
          { value: "do_not_want", label: "I do not want children" },
          { value: "unsure", label: "Unsure" },
          { value: "only_with_right_partner", label: "Only with the right partner" },
          { value: "not_relevant", label: "Not relevant" },
        ],
      },
      datingWithChildren: {
        heading: "How do you feel about dating someone who has children?",
        options: [
          { value: "comfortable", label: "Comfortable" },
          { value: "open_depending", label: "Open depending on circumstances" },
          { value: "prefer_not", label: "Prefer not to" },
          { value: "unsure", label: "Unsure" },
        ],
      },
    },
    api: {
      sectionName: "family",
      successLog: "Data saved successfully:",
      errorLog: "Error saving data:",
    },
  },

  lifestyle: {
    pageTitle: "Lifestyle",
    loading: "Loading…",
    buttonContinue: "Continue",
    buttonSaving: "Saving…",
    errors: {
      signedIn: "You must be signed in.",
      smoking: "Please select whether you smoke.",
      partnerSmoking: "Please select how you feel about a partner who smokes.",
      saveFailed: "Failed to save data",
      unknown: "Something went wrong.",
    },
    fields: {
      smoking: {
        heading: "Do you smoke?",
        options: [
          { value: "no", label: "No" },
          { value: "occasionally", label: "Occasionally" },
          { value: "yes", label: "Yes" },
          { value: "prefer_not_say", label: "Prefer not to say" },
        ],
      },
      partnerSmoking: {
        heading: "How do you feel about a partner who smokes?",
        options: [
          { value: "comfortable", label: "Comfortable" },
          { value: "prefer_they_dont", label: "Prefer they don't" },
          { value: "not_compatible", label: "Not compatible for me" },
          { value: "unsure", label: "Unsure" },
        ],
      },
    },
    api: {
      sectionName: "lifestyle",
      successLog: "Data saved successfully:",
      errorLog: "Error saving data:",
    },
  },

  values: {
    pageTitle: "Values & Faith",
    loading: "Loading…",
    buttonContinue: "Continue",
    buttonSaving: "Saving…",
    errors: {
      signedIn: "You must be signed in.",
      faithRole: "Please select the role faith or spirituality plays in your life.",
      partnerFaithImportance: "Please select how important shared faith is in a partner.",
      traditions: "Please select how cultural or religious traditions feature in your life.",
      saveFailed: "Failed to save data",
      unknown: "Something went wrong.",
    },
    fields: {
      faithRole: {
        heading: "What role does faith or spirituality play in your life?",
        options: [
          { value: "central_daily", label: "Central to my daily life" },
          { value: "important_private", label: "Important but personal" },
          { value: "cultural_background", label: "Part of my cultural background" },
          { value: "occasional", label: "Occasional or situational" },
          { value: "not_a_focus", label: "Not a focus for me" },
          { value: "prefer_not_say", label: "Prefer not to say" },
        ],
      },
      partnerFaithImportance: {
        heading: "How important is it for a partner to share this?",
        options: [
          { value: "important", label: "Important" },
          { value: "preferred", label: "Preferred" },
          { value: "not_important", label: "Not important" },
          { value: "open", label: "Open" },
        ],
      },
      traditions: {
        heading: "Do cultural or religious traditions play a role in your daily or family life?",
        options: [
          { value: "yes_actively", label: "Yes, actively observed" },
          { value: "yes_family_context", label: "Yes, mainly in a family context" },
          { value: "occasionally", label: "Occasionally" },
          { value: "not_really", label: "Not really" },
          { value: "prefer_not_say", label: "Prefer not to say" },
        ],
      },
    },
    api: {
      sectionName: "values",
      successLog: "Data saved successfully:",
      errorLog: "Error saving data:",
    },
  },

  politics: {
    pageTitle: "Politics & Social Views",
    loading: "Loading…",
    buttonContinue: "Continue",
    buttonSaving: "Saving…",
    errors: {
      signedIn: "You must be signed in.",
      politicsImportance: "Please select how much politics or social issues are part of your life.",
      comfortWithDifferences: "Please select your comfort level with different political or social views.",
      saveFailed: "Failed to save data",
      unknown: "Something went wrong.",
    },
    fields: {
      politicsImportance: {
        heading: "How much are politics or social issues part of your life?",
        options: [
          { value: "big_part", label: "A big part of how I see the world" },
          { value: "care_not_central", label: "I care but it's not central" },
          { value: "follow_occasionally", label: "I follow occasionally" },
          { value: "not_important", label: "Not very important" },
          { value: "prefer_not_engage", label: "Prefer not to engage" },
        ],
      },
      comfortWithDifferences: {
        heading: "How comfortable are you dating someone with different political or social views?",
        options: [
          { value: "prefer_similar", label: "Prefer similar views" },
          { value: "some_differences", label: "Some differences are fine" },
          { value: "comfortable", label: "Comfortable with differences" },
          { value: "not_important", label: "Not important" },
        ],
      },
    },
    api: {
      sectionName: "politics",
      successLog: "Data saved successfully:",
      errorLog: "Error saving data:",
    },
  },

  physical: {
    pageTitle: "Physical Attributes",
    loading: "Loading…",
    buttonContinue: "Complete Onboarding",
    buttonSaving: "Saving…",
    errors: {
      signedIn: "You must be signed in.",
      height: "Please enter your height.",
      preferredHeight: "Please enter your preferred height range for a partner.",
      attractionImportance: "Please select how important physical attraction is early on.",
      saveFailed: "Failed to save data",
      unknown: "Something went wrong.",
    },
    fields: {
      height: {
        label: "What is your height?",
        placeholder: "E.g. 5'8",
      },
      preferredHeight: {
        label: "Do you have a preferred height range for a partner?",
        placeholder: "E.g. 5'6",
      },
      attractionImportance: {
        heading: "How important is physical attraction early on?",
        options: [
          { value: "very_important", label: "Very important" },
          { value: "important_grows", label: "Important but grows over time" },
          { value: "develops", label: "Attraction usually develops for me" },
          { value: "unsure", label: "Unsure" },
        ],
      },
    },
    api: {
      sectionName: "physical",
      successLog: "Data saved successfully:",
      errorLog: "Error saving data:",
    },
  },
};

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export const FAQ = {
  title: "Frequently asked questions",
  subtitle: "Love isn't an algorithm. But it helps when you meet the right person",

  questions: [
    {
      question: "How does this work?",
      answer:
        "You begin with a conversation. Juliet listens to how you describe things, not just what you say. From there, Romeo introduces one person at a time. Not often. Each introduction is mutual. You both decide whether you would like to meet. If one of you passes, it ends there.",
    },
    {
      question: "Why don't I see profiles first?",
      answer:
        "Most people are clear in theory, and less clear in practice. What matters more is how you respond when something real is in front of you. That says more than preferences or filters. So we introduce first, and let your reaction guide what comes next.",
    },
    {
      question: "Why don't I see profiles first?",
      answer:
        "Most people are clear in theory, and less clear in practice. What matters more is how you respond when something real is in front of you. That says more than preferences or filters. So we introduce first, and let your reaction guide what comes next.",
    },
    {
      question: "Why use voice instead of typing?",
      answer:
        "People tend to be more honest when they speak. It's harder to filter yourself, and easier to notice what actually matters. You can take your time.",
    },
    {
      question: "How are matches made?",
      answer:
        "Not every possible match is shown. You are introduced when there is a reason to be. What you say matters, but what actually works matters more.",
    },
    {
      question: "How long does it take to get a match?",
      answer:
        "Usually a few days, sometimes longer. We don't introduce people just to keep things moving. If nothing feels right, we wait.",
    },
    {
      question: "What happens after I'm introduced to someone?",
      answer:
        "You'll both decide privately whether you'd like to meet. If both of you say yes, a conversation begins. If not, it ends there quietly.",
    },
    {
      question: "Do I have to respond quickly?",
      answer:
        "Not immediately. But it helps to respond within a day, while it's still fresh.",
    },
    {
      question: "Do I need to keep checking the app?",
      answer:
        "No. We'll let you know when something is ready, or when a decision is needed.",
    },
    {
      question: "What happens if I pass on a match?",
      answer:
        "We pay attention to what you respond to, and what you don't. If you decide not to meet someone, we may ask for a bit of context. Just enough to understand what didn't feel right. We don't introduce someone new immediately. It takes time to find the next person, and it helps to have a bit of distance before moving on. This works best when people are open to meeting. If someone keeps passing without meeting anyone, it becomes harder to understand what they're looking for. In those cases, we may pause the account for a while.",
    },
    {
      question: "Why don't I get another match straight away?",
      answer:
        "We don't introduce someone new immediately after a decision. Part of this is practical. It takes time to find the right person. But it also helps to step back for a moment. It's easier to understand what felt right or off once you've had a bit of space.",
    },
    {
      question: "Can I lose my conversation with Juliet?",
      answer:
        "No. Your responses are saved as you go, and you can return to the conversation at any time.",
    },
    {
      question: "What kind of people are on here?",
      answer:
        "People here tend to be more intentional about what they're looking for. Not everyone is shown, and not every introduction is made. The aim is to introduce people who are actually worth meeting.",
    },
    {
      question: "What if nothing comes up?",
      answer:
        "Then we wait. You won't be shown something just to fill space.",
    },
  ],
};
