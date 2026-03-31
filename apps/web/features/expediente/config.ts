import { BookOpen, MessageSquare, UserPlus } from "lucide-react";

export const setupSteps = [
  {
    number: 1,
    title: "Connect Channels",
    icon: MessageSquare,
    completed: false,
    active: true,
  },
  {
    number: 2,
    title: "Train your AI",
    icon: BookOpen,
    completed: false,
    active: false,
  },
  {
    number: 3,
    title: "Add first Client",
    icon: UserPlus,
    completed: false,
    active: false,
  },
];

export const actionCards = [
  {
    id: "whatsapp",
    title: "Connect WhatsApp Business",
    description:
      "Link your professional WhatsApp to start capturing leads and automating client FAQs.",
    iconKey: "messageSquare" as const,
    buttonText: "Connect Now",
    buttonVariant: "default" as const,
    recommended: true,
  },
  {
    id: "knowledge",
    title: "Knowledge Base Upload",
    description:
      "Upload your firm's templates, local laws, and fee structures so your AI knows exactly how you work.",
    iconKey: "bookOpen" as const,
    buttonText: "Upload Documents",
    buttonVariant: "outline" as const,
  },
  {
    id: "client",
    title: "Add Client Manually",
    description:
      "If you already have a project in progress, add it here to start the AI tracking.",
    iconKey: "userPlus" as const,
    buttonText: "Create First Case",
    buttonVariant: "ghost" as const,
  },
];
