import { PlatformUserFormPage } from "@/features/platform/platform-user-form-page"

export default async function EditPlatformUserRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <PlatformUserFormPage mode="edit" userId={id} />
}
