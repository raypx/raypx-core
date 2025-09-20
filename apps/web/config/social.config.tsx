import { MailIcon } from "lucide-react";

export const getSocialLinks = () => {
  return [
    {
      title: "Email",
      href: `mailto:support@raypx.com`,
      icon: <MailIcon className="size-4 shrink-0" />,
    },
  ];
};
