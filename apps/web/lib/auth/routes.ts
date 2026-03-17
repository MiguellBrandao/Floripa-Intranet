import type { AuthUser } from "@/lib/auth/types"

export function getAuthenticatedHomePath(user: AuthUser | null | undefined) {
  return user?.is_super_admin ? "/platform" : "/dashboard"
}
