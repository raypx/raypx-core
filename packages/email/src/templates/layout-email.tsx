import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
} from "@react-email/components"
import type { ReactNode } from "react"

/**
 * Props for the email layout component
 */
interface EmailLayoutProps {
  /** Email preview text shown in email clients */
  preview: string
  /** Email content to be rendered inside the layout */
  children: ReactNode
}

/**
 * Base email layout component that provides consistent styling
 * and structure for all email templates
 */
export const EmailLayout = ({ preview, children }: EmailLayoutProps) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto max-w-xl px-4 py-8">
            <Section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              {children}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
