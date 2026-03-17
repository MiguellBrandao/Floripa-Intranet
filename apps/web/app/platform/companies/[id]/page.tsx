import { PlatformCompanyDetailPage } from "@/features/platform/platform-company-detail-page"

export default async function PlatformCompanyDetailsRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <PlatformCompanyDetailPage companyId={id} />
}
