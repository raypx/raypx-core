# Auth Features Configuration Usage

## 简单的 const 配置方式

在 `src/features.ts` 中直接修改常量来控制功能开关：

```typescript
export const AUTH_FEATURES = {
  API_KEY: false,           // API Key 功能
  SOCIAL_GITHUB: true,      // GitHub 登录
  SOCIAL_GOOGLE: true,      // Google 登录
  MAGIC_LINK: true,         // 魔法链接
  EMAIL_OTP: true,          // 邮箱验证码
  PASSKEY: true,           // 通行密钥
  ONE_TAP: false,          // Google One Tap
  MULTI_SESSION: true,     // 多会话
  TWO_FACTOR: true,        // 双因素认证
  EMAIL_VERIFICATION: true, // 邮箱验证
  DELETE_USER: true,       // 删除用户
  ORGANIZATION: true,      // 组织功能
  AVATAR: true,           // 头像
  GRAVATAR: true,         // Gravatar
  CAPTCHA: false,         // 验证码
} as const
```

## 在组件中使用

### 1. 在 auth.client.ts 中：
```typescript
import { AUTH_FEATURES } from "./features"

// 只有启用的功能才添加对应插件
const plugins = [
  usernameClient(),
  anonymousClient(),
]

if (AUTH_FEATURES.API_KEY) {
  plugins.push(apiKeyClient())
}

if (AUTH_FEATURES.ORGANIZATION) {
  plugins.push(organizationClient())
  plugins.push(adminClient({ /* config */ }))
}

// ... 其他插件
```

### 2. 在 auth.server.ts 中：
```typescript
import { AUTH_FEATURES } from "./features"

const plugins = [
  username(),
  mcp({ loginPage: "/signin" }),
]

if (AUTH_FEATURES.API_KEY) {
  plugins.push(apiKey())
}

if (AUTH_FEATURES.MAGIC_LINK) {
  plugins.push(magicLink({ /* config */ }))
}

// ... 其他插件
```

### 3. 在 providers.tsx 中：
```typescript
import { AUTH_FEATURES } from "@raypx/auth"

<AuthProvider
  authClient={client}
  apiKey={AUTH_FEATURES.API_KEY}
  magicLink={AUTH_FEATURES.MAGIC_LINK}
  deleteUser={AUTH_FEATURES.DELETE_USER}
  organization={AUTH_FEATURES.ORGANIZATION ? {
    pathMode: "slug",
    apiKey: AUTH_FEATURES.API_KEY,
  } : false}
  // ... 其他属性
>
```

### 4. 在组件中条件渲染：
```typescript
import { AUTH_FEATURES, isFeatureEnabled } from "@raypx/auth"

// 方式 1：直接使用常量
{AUTH_FEATURES.API_KEY && <ApiKeyCard />}

// 方式 2：使用辅助函数
{isFeatureEnabled('API_KEY') && <ApiKeyCard />}
```

## 优势

1. **简单直接**：修改常量即可控制功能
2. **类型安全**：TypeScript 确保配置正确
3. **无动态加载**：避免 better-auth API 调用问题
4. **集中管理**：所有功能开关在一个文件中
5. **易于维护**：清晰的功能划分和注释