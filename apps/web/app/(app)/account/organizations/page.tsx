import { AccountView } from "@raypx/auth/account";
import { createMetadata } from "@raypx/seo";
import type { Metadata } from "next";

export const generateMetadata = async (): Promise<Metadata> => {
  return createMetadata({
    title: "Organizations",
  });
};

export default function OrganizationsPage() {
  return <AccountView view="ORGANIZATIONS" />;
}
