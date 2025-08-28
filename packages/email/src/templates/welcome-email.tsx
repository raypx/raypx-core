import { Text } from "@react-email/components"
import type { EmailTemplateProps } from "../types"
import { EmailLayout } from "./layout-email"

/**
 * Props for the welcome email component
 */
interface WelcomeEmailProps extends Pick<EmailTemplateProps, "username"> {}

/**
 * Welcome email template for new users
 */
const WelcomeEmail = ({ username }: WelcomeEmailProps) => {
  return (
    <EmailLayout preview="Welcome to our app!">
      <Text className="font-bold text-2xl text-gray-800">
        Welcome to our app!
      </Text>
      <Text className="text-gray-600">Hi {username},</Text>
      <Text className="text-gray-600">
        Thank you for joining us. We're excited to have you on board!
      </Text>
      <Text className="mt-6 text-gray-600">
        If you have any questions or need assistance, feel free to contact our
        support team.
      </Text>
    </EmailLayout>
  )
}

WelcomeEmail.PreviewProps = {
  username: "Raypx",
}

export { WelcomeEmail }
