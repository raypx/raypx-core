import { Button, Text } from "@react-email/components"
import type { EmailTemplateProps } from "../types"
import { EmailLayout } from "./layout-email"

/**
 * Props for the verify email component
 */
interface VerifyEmailProps extends Pick<EmailTemplateProps, "username"> {
  /** Verification URL */
  url: string
}

/**
 * Email verification template
 */
const VerifyEmail = ({ url, username }: VerifyEmailProps) => {
  return (
    <EmailLayout preview="Verify your email address">
      <Text className="font-bold text-2xl text-gray-800">
        Verify your email
      </Text>
      <Text className="text-gray-600">Hi {username},</Text>
      <Text className="text-gray-600">
        Please click the button below to verify your email address:
      </Text>
      <Button
        className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white"
        href={url}
      >
        Verify Email
      </Button>
    </EmailLayout>
  )
}

VerifyEmail.PreviewProps = {
  url: "https://example.com/verify-email",
  username: "Raypx",
}

export { VerifyEmail }
