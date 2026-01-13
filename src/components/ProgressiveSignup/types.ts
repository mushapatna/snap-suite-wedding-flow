export interface FormData {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  phoneNumber: string;
  location: string;
  teamSize: string;
  planType: string;
  role: string;
  yearsInBusiness: string;
  weddingsPerYear: string;
  servicesOffered: string[];
  currentTools: string[];
  referralSource: string;
}

export interface StepConfig {
  title: string;
  description: string;
  field: string;
  type: 'text' | 'email' | 'password' | 'select' | 'radio' | 'checkbox';
  placeholder?: string;
  required: boolean;
  options?: { value: string; label: string }[];
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  description: string;
}

export const initialFormData: FormData = {
  fullName: "",
  email: "",
  password: "",
  companyName: "",
  phoneNumber: "",
  location: "",
  teamSize: "",
  planType: "basic",
  role: "",
  yearsInBusiness: "",
  weddingsPerYear: "",
  servicesOffered: [],
  currentTools: [],
  referralSource: ""
};

export const steps: StepConfig[] = [
  {
    title: "What's your name?",
    description: "Let's start with the basics",
    field: "fullName",
    type: "text",
    placeholder: "Enter your full name",
    required: true
  },
  {
    title: "Your email address?",
    description: "We'll use this to create your account",
    field: "email",
    type: "email",
    placeholder: "your@email.com",
    required: true
  },
  {
    title: "Create a password",
    description: "Choose a secure password for your account",
    field: "password",
    type: "password",
    placeholder: "Enter a strong password",
    required: true
  },
  {
    title: "Company or studio name?",
    description: "What should we call your business?",
    field: "companyName",
    type: "text",
    placeholder: "Your Studio Name",
    required: false
  },
  {
    title: "What's your role?",
    description: "This helps us customize your experience",
    field: "role",
    type: "radio",
    options: [
      { value: "photographer", label: "Photographer" },
      { value: "videographer", label: "Videographer" },
      { value: "editor", label: "Editor" },
      { value: "admin", label: "Agency Admin" }
    ],
    required: true
  },
  {
    title: "How big is your team?",
    description: "Including yourself",
    field: "teamSize",
    type: "select",
    options: [
      { value: "solo", label: "Just me (Solo photographer)" },
      { value: "2-5", label: "2-5 people" },
      { value: "6-10", label: "6-10 people" },
      { value: "11-25", label: "11-25 people" },
      { value: "25+", label: "25+ people" }
    ],
    required: true
  },
  {
    title: "How many weddings per year?",
    description: "This helps us recommend the right plan",
    field: "weddingsPerYear",
    type: "select",
    options: [
      { value: "1-5", label: "1-5 weddings" },
      { value: "6-15", label: "6-15 weddings" },
      { value: "16-30", label: "16-30 weddings" },
      { value: "31-50", label: "31-50 weddings" },
      { value: "50+", label: "50+ weddings" }
    ],
    required: true
  }
];

export const plans: Plan[] = [
  { id: "basic", name: "Basic", price: "₹1,500", description: "Perfect for small studios" },
  { id: "advance", name: "Advance", price: "₹3,000", description: "For growing agencies" },
  { id: "premium", name: "Premium", price: "₹4,500", description: "For established studios" },
  { id: "unlimited", name: "Unlimited", price: "₹10,000", description: "For large agencies" }
];