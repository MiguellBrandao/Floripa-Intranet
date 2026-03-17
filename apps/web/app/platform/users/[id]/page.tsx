import { PlatformUserDetailPage } from "@/features/platform/platform-user-detail-page"

export default async function PlatformUserDetailsRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <PlatformUserDetailPage userId={id} />
}
