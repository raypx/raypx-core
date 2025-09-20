import { AccountView } from "@raypx/auth/account";
import { createMetadata } from "@raypx/seo";
import type { Metadata } from "next";

export const generateMetadata = async (): Promise<Metadata> => {
  return createMetadata({
    title: "API Keys",
  });
};

export default function ApiKeysPage() {
  return <AccountView view="API_KEYS" />;
}
