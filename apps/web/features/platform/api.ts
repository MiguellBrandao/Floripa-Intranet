import { apiFetch } from "@/lib/api/http"

import type {
  CreatePlatformCompanyMembershipPayload,
  CreatePlatformCompanyPayload,
  CreatePlatformUserPayload,
  PlatformCompany,
  PlatformCompanyMembership,
  PlatformTeam,
  PlatformUser,
  PlatformUserDetail,
  UpdatePlatformCompanyMembershipPayload,
  UpdatePlatformCompanyPayload,
  UpdatePlatformUserPayload,
} from "@/features/platform/types"

export function listPlatformCompanies(authToken: string) {
  return apiFetch<PlatformCompany[]>("/platform/companies", {
    authToken,
    requireAuth: true,
  })
}

export function getPlatformCompanyById(authToken: string, companyId: string) {
  return apiFetch<PlatformCompany>(`/platform/companies/${companyId}`, {
    authToken,
    requireAuth: true,
  })
}

export function createPlatformCompany(
  authToken: string,
  payload: CreatePlatformCompanyPayload
) {
  return apiFetch<PlatformCompany>("/platform/companies", {
    method: "POST",
    authToken,
    requireAuth: true,
    body: JSON.stringify(payload),
  })
}

export function updatePlatformCompany(
  authToken: string,
  companyId: string,
  payload: UpdatePlatformCompanyPayload
) {
  return apiFetch<PlatformCompany>(`/platform/companies/${companyId}`, {
    method: "PATCH",
    authToken,
    requireAuth: true,
    body: JSON.stringify(payload),
  })
}

export function deletePlatformCompany(authToken: string, companyId: string) {
  return apiFetch<void>(`/platform/companies/${companyId}`, {
    method: "DELETE",
    authToken,
    requireAuth: true,
  })
}

export function listPlatformCompanyMemberships(
  authToken: string,
  companyId: string
) {
  return apiFetch<PlatformCompanyMembership[]>(
    `/platform/companies/${companyId}/memberships`,
    {
      authToken,
      requireAuth: true,
    }
  )
}

export function createPlatformCompanyMembership(
  authToken: string,
  companyId: string,
  payload: CreatePlatformCompanyMembershipPayload
) {
  return apiFetch<PlatformCompanyMembership>(
    `/platform/companies/${companyId}/memberships`,
    {
      method: "POST",
      authToken,
      requireAuth: true,
      body: JSON.stringify(payload),
    }
  )
}

export function updatePlatformCompanyMembership(
  authToken: string,
  membershipId: string,
  payload: UpdatePlatformCompanyMembershipPayload
) {
  return apiFetch<PlatformCompanyMembership>(
    `/platform/company-memberships/${membershipId}`,
    {
      method: "PATCH",
      authToken,
      requireAuth: true,
      body: JSON.stringify(payload),
    }
  )
}

export function deletePlatformCompanyMembership(
  authToken: string,
  membershipId: string
) {
  return apiFetch<void>(`/platform/company-memberships/${membershipId}`, {
    method: "DELETE",
    authToken,
    requireAuth: true,
  })
}

export function listPlatformCompanyTeams(authToken: string, companyId: string) {
  return apiFetch<PlatformTeam[]>(`/platform/companies/${companyId}/teams`, {
    authToken,
    requireAuth: true,
  })
}

export function listPlatformUsers(authToken: string) {
  return apiFetch<PlatformUser[]>("/platform/users", {
    authToken,
    requireAuth: true,
  })
}

export function getPlatformUserById(authToken: string, userId: string) {
  return apiFetch<PlatformUserDetail>(`/platform/users/${userId}`, {
    authToken,
    requireAuth: true,
  })
}

export function createPlatformUser(authToken: string, payload: CreatePlatformUserPayload) {
  return apiFetch<PlatformUserDetail>("/platform/users", {
    method: "POST",
    authToken,
    requireAuth: true,
    body: JSON.stringify(payload),
  })
}

export function updatePlatformUser(
  authToken: string,
  userId: string,
  payload: UpdatePlatformUserPayload
) {
  return apiFetch<PlatformUserDetail>(`/platform/users/${userId}`, {
    method: "PATCH",
    authToken,
    requireAuth: true,
    body: JSON.stringify(payload),
  })
}

export function deletePlatformUser(authToken: string, userId: string) {
  return apiFetch<void>(`/platform/users/${userId}`, {
    method: "DELETE",
    authToken,
    requireAuth: true,
  })
}
