import { useTheme as useNextTheme } from "@raypx/ui/hooks/use-theme"

export const useTheme = () => {
  const { resolvedTheme, setTheme, theme } = useNextTheme()

  return {
    resolvedTheme: resolvedTheme as "light" | "dark",
    setTheme,
    theme: theme as "light" | "dark" | "system",
  }
}
