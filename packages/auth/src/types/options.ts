import type { SocialProvider } from "better-auth/social-providers";
import type { ComponentType } from "react";
import type { Provider } from "../core/lib/providers/social-providers";
import type { AccountViewPaths, OrganizationViewPaths } from "../core/lib/view-paths";
import type { AuthClient } from "./core";

export type PasswordValidation = {
  maxLength?: number;
  minLength?: number;
  regex?: RegExp;
};

export type CredentialsOptions = {
  confirmPassword?: boolean;
  forgotPassword?: boolean;
  passwordValidation?: PasswordValidation;
  rememberMe?: boolean;
  username?: boolean;
};

export type SignUpOptions = {
  fields?: string[];
};

export type AccountOptions = {
  basePath?: string;
  fields: string[];
  viewPaths?: Partial<AccountViewPaths>;
};

export type AccountOptionsContext = {
  basePath: string;
  fields: string[];
  viewPaths: AccountViewPaths;
};

export type DeleteUserOptions = {
  verification?: boolean;
};

export type Image = ComponentType<{
  src: string;
  alt: string;
  className?: string;
}>;

export type AvatarOptions = {
  upload?: (file: File) => Promise<string | undefined | null>;
  delete?: (url: string) => Promise<void>;
  size: number;
  extension: string;
  Image?: Image;
};

export type GravatarOptions = {
  d?: string;
  size?: number;
  jpg?: boolean;
  forceDefault?: boolean;
};

export type OrganizationLogoOptions = {
  upload?: (file: File) => Promise<string | undefined | null>;
  delete?: (url: string) => Promise<void>;
  size: number;
  extension: string;
};

export type OrganizationOptions = {
  logo?: boolean | Partial<OrganizationLogoOptions>;
  customRoles?: Array<{ role: string; label: string }>;
  apiKey?: boolean;
  basePath?: string;
  pathMode?: "default" | "slug";
  slug?: string;
  personalPath?: string;
  viewPaths?: Partial<OrganizationViewPaths>;
};

export type OrganizationOptionsContext = {
  logo?: OrganizationLogoOptions;
  customRoles: Array<{ role: string; label: string }>;
  apiKey?: boolean;
  basePath: string;
  pathMode?: "default" | "slug";
  slug?: string;
  personalPath?: string;
  viewPaths: OrganizationViewPaths;
};

export type SocialOptions = {
  providers: SocialProvider[];
  signIn?: (params: Parameters<AuthClient["signIn"]["social"]>[0]) => Promise<unknown>;
};

export type GenericOAuthOptions = {
  providers: Provider[];
  signIn?: (params: Parameters<AuthClient["signIn"]["oauth2"]>[0]) => Promise<unknown>;
};
