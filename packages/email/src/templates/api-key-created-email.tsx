import { Button, Text } from "@react-email/components"
import { EmailLayout } from "./layout-email"

export interface ApiKeyCreatedEmailProps {
  username: string
  keyName: string
  keyPrefix: string
  permissions?: string[]
  rateLimitInfo?: {
    maxRequests: number
    timeWindow: string
  }
  createdAt: string
  dashboardUrl?: string
  securityTips?: boolean
}

const ApiKeyCreatedEmail = ({
  username,
  keyName,
  keyPrefix,
  permissions,
  rateLimitInfo,
  createdAt,
  dashboardUrl,
  securityTips = true,
}: ApiKeyCreatedEmailProps) => {
  return (
    <EmailLayout preview={`New API Key Created: ${keyName}`}>
      <Text className="font-bold text-2xl text-gray-800">
        🔑 New API Key Created
      </Text>

      <Text className="text-gray-600">Hi {username},</Text>

      <Text className="text-gray-600">
        A new API key has been successfully created for your account.
      </Text>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg my-4">
        <Text className="font-semibold text-gray-800 mb-2">
          API Key Details:
        </Text>
        <Text className="text-sm text-gray-700 my-1">
          <strong>Name:</strong> {keyName}
        </Text>
        <Text className="text-sm text-gray-700 my-1">
          <strong>Key Prefix:</strong> {keyPrefix}***
        </Text>
        <Text className="text-sm text-gray-700 my-1">
          <strong>Created:</strong> {createdAt}
        </Text>
        {permissions && permissions.length > 0 && (
          <Text className="text-sm text-gray-700 my-1">
            <strong>Permissions:</strong> {permissions.join(", ")}
          </Text>
        )}
        {rateLimitInfo && (
          <Text className="text-sm text-gray-700 my-1">
            <strong>Rate Limit:</strong> {rateLimitInfo.maxRequests} requests
            per {rateLimitInfo.timeWindow}
          </Text>
        )}
      </div>

      {securityTips && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg my-4">
          <Text className="font-semibold text-yellow-800 mb-2">
            🔒 Security Tips:
          </Text>
          <Text className="text-sm text-yellow-700 my-1">
            • Store your API key securely and never share it publicly
          </Text>
          <Text className="text-sm text-yellow-700 my-1">
            • Use environment variables to store keys in your applications
          </Text>
          <Text className="text-sm text-yellow-700 my-1">
            • Rotate your API keys regularly for better security
          </Text>
          <Text className="text-sm text-yellow-700 my-1">
            • Monitor your API usage and set up alerts for unusual activity
          </Text>
        </div>
      )}

      {dashboardUrl && (
        <>
          <Text className="text-gray-600">
            You can manage this API key and monitor its usage in your dashboard:
          </Text>

          <Button
            href={dashboardUrl}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Manage API Keys
          </Button>
        </>
      )}

      <Text className="text-gray-500 text-sm mt-6">
        If you didn't create this API key, please contact our support team
        immediately and review your account security settings.
      </Text>

      <Text className="text-gray-500 text-sm">
        Need help with API integration? Check out our documentation or contact
        our support team.
      </Text>
    </EmailLayout>
  )
}

ApiKeyCreatedEmail.PreviewProps = {
  username: "Raypx",
  keyName: "API Key 1",
  keyPrefix: "1234567890",
  permissions: ["read", "write"],
  rateLimitInfo: {
    maxRequests: 1000,
    timeWindow: "1 hour",
  },
}

export { ApiKeyCreatedEmail }
