import type {
  CreatePlatformCompanyMembershipPayload,
  CreatePlatformCompanyPayload,
  CreatePlatformUserPayload,
  PlatformCompany,
  PlatformCompanyMembership,
  PlatformUser,
  UpdatePlatformCompanyMembershipPayload,
  UpdatePlatformCompanyPayload,
  UpdatePlatformUserPayload,
} from "@/features/platform/types"
import type {
  PlatformCompanyFormValues,
  PlatformMembershipFormValues,
  PlatformUserFormValues,
} from "@/features/platform/schema"

export function toCreatePlatformCompanyPayload(
  values: PlatformCompanyFormValues
): CreatePlatformCompanyPayload {
  return {
    name: values.name.trim(),
    slug: values.slug.trim().toLowerCase(),
    logo_path: values.logo_path.trim() || undefined,
    favicon_path: values.favicon_path.trim() || undefined,
    address: values.address.trim(),
    nif: values.nif.trim(),
    mobile_phone: values.mobile_phone.trim(),
    email: values.email.trim().toLowerCase(),
    iban: values.iban.trim(),
    initial_admin_user_id:
      values.initial_admin_mode === "existing"
        ? values.initial_admin_user_id.trim()
        : undefined,
    initial_admin_email:
      values.initial_admin_mode === "new"
        ? values.initial_admin_email.trim().toLowerCase()
        : undefined,
    initial_admin_password:
      values.initial_admin_mode === "new"
        ? values.initial_admin_password.trim()
        : undefined,
    initial_admin_name: values.initial_admin_name.trim(),
    initial_admin_phone: values.initial_admin_phone.trim() || undefined,
  }
}

export function toUpdatePlatformCompanyPayload(
  values: PlatformCompanyFormValues
): UpdatePlatformCompanyPayload {
  return {
    name: values.name.trim(),
    slug: values.slug.trim().toLowerCase(),
    logo_path: values.logo_path.trim() || undefined,
    favicon_path: values.favicon_path.trim() || undefined,
    address: values.address.trim(),
    nif: values.nif.trim(),
    mobile_phone: values.mobile_phone.trim(),
    email: values.email.trim().toLowerCase(),
    iban: values.iban.trim(),
  }
}

export function toPlatformCompanyFormValues(
  company: PlatformCompany
): PlatformCompanyFormValues {
  return {
    name: company.name,
    slug: company.slug,
    logo_path: company.logo_path ?? "",
    favicon_path: company.favicon_path ?? "",
    address: company.address,
    nif: company.nif,
    mobile_phone: company.mobile_phone,
    email: company.email,
    iban: company.iban,
    initial_admin_mode: "existing",
    initial_admin_user_id: "",
    initial_admin_email: "",
    initial_admin_password: "",
    initial_admin_name: "",
    initial_admin_phone: "",
  }
}

export function toCreatePlatformUserPayload(
  values: PlatformUserFormValues
): CreatePlatformUserPayload {
  return {
    email: values.email.trim().toLowerCase(),
    password: values.password.trim(),
    is_super_admin: values.is_super_admin,
  }
}

export function toUpdatePlatformUserPayload(
  values: PlatformUserFormValues
): UpdatePlatformUserPayload {
  return {
    email: values.email.trim().toLowerCase(),
    password: values.password.trim() || undefined,
    is_super_admin: values.is_super_admin,
  }
}

export function toPlatformUserFormValues(
  user: PlatformUser
): PlatformUserFormValues {
  return {
    email: user.email,
    password: "",
    is_super_admin: user.is_super_admin,
  }
}

export function toCreatePlatformMembershipPayload(
  values: PlatformMembershipFormValues
): CreatePlatformCompanyMembershipPayload {
  return {
    existing_user_id:
      values.user_mode === "existing" ? values.existing_user_id.trim() : undefined,
    email:
      values.user_mode === "new" ? values.email.trim().toLowerCase() : undefined,
    password: values.user_mode === "new" ? values.password.trim() : undefined,
    role: values.role,
    name: values.name.trim(),
    phone: values.phone.trim() || undefined,
    active: values.active,
    team_ids: values.team_ids,
  }
}

export function toUpdatePlatformMembershipPayload(
  values: PlatformMembershipFormValues
): UpdatePlatformCompanyMembershipPayload {
  return {
    role: values.role,
    name: values.name.trim(),
    phone: values.phone.trim() || undefined,
    active: values.active,
    team_ids: values.team_ids,
  }
}

export function toPlatformMembershipFormValues(
  membership: PlatformCompanyMembership
): PlatformMembershipFormValues {
  return {
    user_mode: "existing",
    existing_user_id: membership.user_id ?? "",
    email: membership.email ?? "",
    password: "",
    role: membership.role,
    name: membership.name,
    phone: membership.phone ?? "",
    active: membership.active,
    team_ids: membership.team_ids ?? [],
  }
}

export function formatPlatformDate(value?: string) {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
  }).format(new Date(value))
}
