"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  createPlatformUser,
  getPlatformUserById,
  updatePlatformUser,
} from "@/features/platform/api"
import {
  platformUserFormDefaults,
  platformUserFormSchema,
  type PlatformUserFormValues,
} from "@/features/platform/schema"
import {
  toCreatePlatformUserPayload,
  toPlatformUserFormValues,
  toUpdatePlatformUserPayload,
} from "@/features/platform/utils"
import { useAuthStore } from "@/lib/auth/store"

type PlatformUserFormPageProps = {
  mode: "create" | "edit"
  userId?: string
}

export function PlatformUserFormPage({
  mode,
  userId,
}: PlatformUserFormPageProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((state) => state.accessToken)

  const form = useForm<PlatformUserFormValues>({
    resolver: zodResolver(
      platformUserFormSchema.superRefine((values, context) => {
        if (mode === "create" && !values.password.trim()) {
          context.addIssue({
            code: "custom",
            path: ["password"],
            message: "Indica a password.",
          })
        }

        if (values.password.trim() && values.password.trim().length < 8) {
          context.addIssue({
            code: "custom",
            path: ["password"],
            message: "A password deve ter pelo menos 8 caracteres.",
          })
        }
      })
    ),
    defaultValues: platformUserFormDefaults,
  })

  const userQuery = useQuery({
    queryKey: ["platform", "users", "detail", userId, accessToken],
    queryFn: () => getPlatformUserById(accessToken ?? "", userId ?? ""),
    enabled: Boolean(accessToken && userId && mode === "edit"),
  })

  useEffect(() => {
    if (mode === "edit" && userQuery.data) {
      form.reset(toPlatformUserFormValues(userQuery.data))
    }
  }, [form, mode, userQuery.data])

  const saveMutation = useMutation({
    mutationFn: async (values: PlatformUserFormValues) => {
      if (!accessToken) {
        throw new Error("Sem sessao ativa.")
      }

      if (mode === "edit" && userId) {
        return updatePlatformUser(
          accessToken,
          userId,
          toUpdatePlatformUserPayload(values)
        )
      }

      return createPlatformUser(accessToken, toCreatePlatformUserPayload(values))
    },
    onSuccess: async (user) => {
      await queryClient.invalidateQueries({ queryKey: ["platform"] })
      toast.success(
        mode === "edit"
          ? "Utilizador atualizado com sucesso."
          : "Utilizador criado com sucesso."
      )
      router.push(user?.id ? `/platform/users/${user.id}` : "/platform/users")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Nao foi possivel guardar o utilizador.")
    },
  })

  function onSubmit(values: PlatformUserFormValues) {
    saveMutation.mutate(values)
  }

  if (!accessToken) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sessao em falta</CardTitle>
          <CardDescription>Faz login novamente antes de gerir utilizadores.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-3xl border-[#dfd7c0] bg-white">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>{mode === "edit" ? "Editar utilizador" : "Criar utilizador"}</CardTitle>
            <CardDescription>
              {mode === "edit"
                ? "Atualiza email, password e permissao global."
                : "Cria uma nova conta global na plataforma."}
            </CardDescription>
          </div>
          <Button asChild variant="outline">
            <Link href="/platform/users">Voltar a listagem</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {mode === "edit" && userQuery.isLoading ? (
          <div className="rounded-2xl border border-dashed border-[#dfd7c0] bg-[#fbf8ef] p-5 text-sm text-muted-foreground">
            A carregar utilizador...
          </div>
        ) : (
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="gap-5">
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="platform-user-email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="platform-user-email"
                      type="email"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="platform-user-password">
                      {mode === "edit" ? "Nova password" : "Password"}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="platform-user-password"
                      type="password"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="is_super_admin"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Permissao global</FieldLabel>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant={field.value ? "default" : "outline"}
                        className={field.value ? "bg-[#215442] text-white hover:bg-[#183b2f]" : ""}
                        onClick={() => field.onChange(true)}
                      >
                        Super Admin
                      </Button>
                      <Button
                        type="button"
                        variant={!field.value ? "default" : "outline"}
                        className={!field.value ? "bg-[#805a2a] text-white hover:bg-[#6b4b23]" : ""}
                        onClick={() => field.onChange(false)}
                      >
                        User normal
                      </Button>
                    </div>
                  </Field>
                )}
              />

              {saveMutation.isError ? (
                <FieldError>{saveMutation.error.message}</FieldError>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  className="bg-[#215442] text-white hover:bg-[#183b2f]"
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending
                    ? "A guardar..."
                    : mode === "edit"
                      ? "Guardar alteracoes"
                      : "Criar utilizador"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    form.reset(
                      mode === "edit" && userQuery.data
                        ? toPlatformUserFormValues(userQuery.data)
                        : platformUserFormDefaults
                    )
                  }
                >
                  Limpar formulario
                </Button>
              </div>
            </FieldGroup>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
