import { Button, Text } from "@react-email/components"
import { EmailLayout } from "./layout-email"

export type SecurityAlertType =
  | "suspicious_login"
  | "password_changed"
  | "email_changed"
  | "two_factor_enabled"
  | "two_factor_disabled"
  | "api_key_created"
  | "api_key_deleted"

export interface SecurityAlertEmailProps {
  username: string
  alertType: SecurityAlertType
  details: {
    timestamp: string
    location?: string
    ipAddress?: string
    userAgent?: string
    deviceInfo?: string
  }
  actionUrl?: string
  actionText?: string
}

const getAlertContent = (alertType: SecurityAlertType) => {
  const alertConfig = {
    suspicious_login: {
      title: "Suspicious Login Detected",
      message:
        "We detected a login to your account from an unrecognized device or location.",
      severity: "high" as const,
    },
    password_changed: {
      title: "Password Changed",
      message: "Your account password was successfully changed.",
      severity: "medium" as const,
    },
    email_changed: {
      title: "Email Address Changed",
      message: "Your account email address was successfully updated.",
      severity: "medium" as const,
    },
    two_factor_enabled: {
      title: "Two-Factor Authentication Enabled",
      message: "Two-factor authentication has been enabled on your account.",
      severity: "low" as const,
    },
    two_factor_disabled: {
      title: "Two-Factor Authentication Disabled",
      message: "Two-factor authentication has been disabled on your account.",
      severity: "high" as const,
    },
    api_key_created: {
      title: "New API Key Created",
      message: "A new API key was created for your account.",
      severity: "medium" as const,
    },
    api_key_deleted: {
      title: "API Key Deleted",
      message: "An API key was deleted from your account.",
      severity: "low" as const,
    },
  }

  return alertConfig[alertType]
}

const SecurityAlertEmail = ({
  username,
  alertType,
  details,
  actionUrl,
  actionText,
}: SecurityAlertEmailProps) => {
  const alert = getAlertContent(alertType)
  const severityColors = {
    high: "text-red-600",
    medium: "text-orange-600",
    low: "text-green-600",
  }

  return (
    <EmailLayout preview={`Security Alert: ${alert.title}`}>
      <Text className={`font-bold text-2xl ${severityColors[alert.severity]}`}>
        🔒 Security Alert
      </Text>

      <Text className="font-semibold text-xl text-gray-800 mt-4">
        {alert.title}
      </Text>

      <Text className="text-gray-600">Hi {username},</Text>

      <Text className="text-gray-600">{alert.message}</Text>

      <div className="bg-gray-50 p-4 rounded-lg my-4">
        <Text className="font-semibold text-gray-800 mb-2">
          Activity Details:
        </Text>
        <Text className="text-sm text-gray-600 my-1">
          <strong>Time:</strong> {details.timestamp}
        </Text>
        {details.location && (
          <Text className="text-sm text-gray-600 my-1">
            <strong>Location:</strong> {details.location}
          </Text>
        )}
        {details.ipAddress && (
          <Text className="text-sm text-gray-600 my-1">
            <strong>IP Address:</strong> {details.ipAddress}
          </Text>
        )}
        {details.userAgent && (
          <Text className="text-sm text-gray-600 my-1">
            <strong>Device:</strong> {details.deviceInfo || details.userAgent}
          </Text>
        )}
      </div>

      {alert.severity === "high" && (
        <Text className="text-red-600 font-medium">
          ⚠️ If this wasn't you, please secure your account immediately.
        </Text>
      )}

      {actionUrl && actionText && (
        <>
          <Text className="text-gray-600 mt-4">
            {alert.severity === "high"
              ? "If you didn't perform this action, please review your account security:"
              : "You can review this activity in your account security settings:"}
          </Text>

          <Button
            href={actionUrl}
            className={`px-6 py-3 rounded-lg font-medium text-white ${
              alert.severity === "high"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {actionText}
          </Button>
        </>
      )}

      <Text className="text-gray-500 text-sm mt-6">
        This is an automated security notification. If you have any concerns
        about your account security, please contact our support team
        immediately.
      </Text>
    </EmailLayout>
  )
}

SecurityAlertEmail.PreviewProps = {
  username: "Raypx",
  alertType: "suspicious_login",
  details: {
    timestamp: "2021-01-01 12:00:00",
  },
}

export { SecurityAlertEmail }
