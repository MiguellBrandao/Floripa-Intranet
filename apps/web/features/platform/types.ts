import type { CompanyRole } from "@/lib/auth/types"

export type PlatformCompany = {
  id: string
  name: string
  slug: string
  logo_path: string | null
  favicon_path: string | null
  address: string
  nif: string
  mobile_phone: string
  email: string
  iban: string
  created_at: string
  member_count: number
  active_admin_count: number
}

export type PlatformTeam = {
  id: string
  company_id: string
  name: string
  created_at: string
}

export type PlatformCompanyMembership = {
  id: string
  company_id: string
  company_name: string
  user_id: string | null
  email: string | null
  role: CompanyRole
  name: string
  phone: string | null
  active: boolean
  created_at: string
  team_ids: string[]
}

export type PlatformUser = {
  id: string
  email: string
  is_super_admin: boolean
  created_at: string
  membership_count: number
}

export type PlatformUserDetail = PlatformUser & {
  memberships: PlatformCompanyMembership[]
}

export type CreatePlatformCompanyPayload = {
  name: string
  slug: string
  logo_path?: string
  favicon_path?: string
  address: string
  nif: string
  mobile_phone: string
  email: string
  iban: string
  initial_admin_user_id?: string
  initial_admin_email?: string
  initial_admin_password?: string
  initial_admin_name: string
  initial_admin_phone?: string
}

export type UpdatePlatformCompanyPayload = Partial<
  Omit<
    CreatePlatformCompanyPayload,
    | "initial_admin_user_id"
    | "initial_admin_email"
    | "initial_admin_password"
    | "initial_admin_name"
    | "initial_admin_phone"
  >
>

export type CreatePlatformUserPayload = {
  email: string
  password: string
  is_super_admin?: boolean
}

export type UpdatePlatformUserPayload = {
  email?: string
  password?: string
  is_super_admin?: boolean
}

export type CreatePlatformCompanyMembershipPayload = {
  existing_user_id?: string
  email?: string
  password?: string
  role: CompanyRole
  name: string
  phone?: string
  team_ids?: string[]
  active?: boolean
}

export type UpdatePlatformCompanyMembershipPayload = {
  role?: CompanyRole
  name?: string
  phone?: string
  team_ids?: string[]
  active?: boolean
}
