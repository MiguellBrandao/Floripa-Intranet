import { PlatformCompanyMembersPage } from "@/features/platform/platform-company-members-page"

export default async function PlatformCompanyMembersRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <PlatformCompanyMembersPage companyId={id} />
}
