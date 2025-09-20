import { AccountView } from "@raypx/auth/account";
import { createMetadata } from "@raypx/seo";
import type { Metadata } from "next";

export const generateMetadata = async (): Promise<Metadata> => {
  return createMetadata({
    title: "Security",
  });
};

export default function SecurityPage() {
  return <AccountView view="SECURITY" />;
}
