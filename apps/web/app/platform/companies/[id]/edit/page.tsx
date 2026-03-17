import { PlatformCompanyFormPage } from "@/features/platform/platform-company-form-page"

export default async function EditPlatformCompanyRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <PlatformCompanyFormPage mode="edit" companyId={id} />
}
