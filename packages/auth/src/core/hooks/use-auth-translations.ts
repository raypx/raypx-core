import { useTranslations } from "next-intl";

type UseTranslations = ReturnType<typeof useTranslations>;

export type AuthTranslations = {
  t: UseTranslations;
};

/**
 * Returns the translations for the auth namespace
 * @returns The translations for the auth namespace
 */
export function useAuthTranslations(): AuthTranslations {
  const translations = useTranslations("auth");

  // Create a wrapper function that allows the second parameter to be undefined
  const t = (...args: Parameters<UseTranslations>) => {
    // If the second argument is undefined, call without it
    if (args.length === 2 && args[1] === undefined) {
      return translations(args[0]);
    }
    return translations(...args);
  };

  // Copy the additional methods from the original translations function
  t.rich = translations.rich;
  t.markup = translations.markup;
  t.raw = translations.raw;
  t.has = translations.has;

  return {
    t,
  };
}
