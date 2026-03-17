"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createPlatformCompanyMembership,
  updatePlatformCompanyMembership,
} from "@/features/platform/api"
import {
  platformMembershipFormDefaults,
  platformMembershipFormSchema,
  type PlatformMembershipFormValues,
} from "@/features/platform/schema"
import type {
  PlatformCompanyMembership,
  PlatformTeam,
  PlatformUser,
} from "@/features/platform/types"
import {
  toCreatePlatformMembershipPayload,
  toPlatformMembershipFormValues,
  toUpdatePlatformMembershipPayload,
} from "@/features/platform/utils"
import { useAuthStore } from "@/lib/auth/store"

type PlatformMembershipFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  companyId: string
  membership?: PlatformCompanyMembership | null
  users: PlatformUser[]
  teams: PlatformTeam[]
}

export function PlatformMembershipFormDialog({
  open,
  onOpenChange,
  mode,
  companyId,
  membership,
  users,
  teams,
}: PlatformMembershipFormDialogProps) {
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((state) => state.accessToken)

  const form = useForm<PlatformMembershipFormValues>({
    resolver: zodResolver(
      platformMembershipFormSchema.superRefine((values, context) => {
        if (mode !== "create") {
          return
        }

        if (values.user_mode === "existing") {
          if (!values.existing_user_id.trim()) {
            context.addIssue({
              code: "custom",
              path: ["existing_user_id"],
              message: "Escolhe um utilizador.",
            })
          }
          return
        }

        if (!values.email.trim()) {
          context.addIssue({
            code: "custom",
            path: ["email"],
            message: "Indica o email.",
          })
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
          context.addIssue({
            code: "custom",
            path: ["email"],
            message: "Indica um email valido.",
          })
        }

        if (!values.password.trim()) {
          context.addIssue({
            code: "custom",
            path: ["password"],
            message: "Indica a password.",
          })
        } else if (values.password.trim().length < 8) {
          context.addIssue({
            code: "custom",
            path: ["password"],
            message: "A password deve ter pelo menos 8 caracteres.",
          })
        }
      })
    ),
    defaultValues: platformMembershipFormDefaults,
  })

  const userMode = useWatch({
    control: form.control,
    name: "user_mode",
  })
  const selectedTeamIds = useWatch({
    control: form.control,
    name: "team_ids",
  })

  useEffect(() => {
    if (!open) {
      form.reset(platformMembershipFormDefaults)
      return
    }

    if (mode === "edit" && membership) {
      form.reset(toPlatformMembershipFormValues(membership))
      return
    }

    form.reset(platformMembershipFormDefaults)
  }, [form, membership, mode, open])

  const saveMutation = useMutation({
    mutationFn: async (values: PlatformMembershipFormValues) => {
      if (!accessToken) {
        throw new Error("Sem sessao ativa.")
      }

      if (mode === "edit" && membership) {
        return updatePlatformCompanyMembership(
          accessToken,
          membership.id,
          toUpdatePlatformMembershipPayload(values)
        )
      }

      return createPlatformCompanyMembership(
        accessToken,
        companyId,
        toCreatePlatformMembershipPayload(values)
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["platform"] })
      toast.success(
        mode === "edit"
          ? "Membership atualizada com sucesso."
          : "Membership criada com sucesso."
      )
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Nao foi possivel guardar a membership.")
    },
  })

  function toggleTeamSelection(teamId: string) {
    const currentTeamIds = form.getValues("team_ids")
    const nextValue = currentTeamIds.includes(teamId)
      ? currentTeamIds.filter((value) => value !== teamId)
      : [...currentTeamIds, teamId]

    form.setValue("team_ids", nextValue, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  function onSubmit(values: PlatformMembershipFormValues) {
    saveMutation.mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar membership" : "Adicionar membership"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Atualiza role, estado e equipas desta ligacao a empresa."
              : "Liga um utilizador existente ou novo a esta empresa."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-5">
            {mode === "create" ? (
              <>
                <Controller
                  control={form.control}
                  name="user_mode"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Origem do utilizador</FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger aria-invalid={fieldState.invalid}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="existing">Utilizador existente</SelectItem>
                          <SelectItem value="new">Criar novo utilizador</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                {userMode === "existing" ? (
                  <Controller
                    control={form.control}
                    name="existing_user_id"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Utilizador</FieldLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger aria-invalid={fieldState.invalid}>
                            <SelectValue placeholder="Seleciona um utilizador" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.length ? (
                              users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.email}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="__empty" disabled>
                                Sem utilizadores disponiveis
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                ) : (
                  <div className="grid gap-5 md:grid-cols-2">
                    <Controller
                      control={form.control}
                      name="email"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="membership-email">Email</FieldLabel>
                          <Input
                            {...field}
                            id="membership-email"
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
                          <FieldLabel htmlFor="membership-password">Password</FieldLabel>
                          <Input
                            {...field}
                            id="membership-password"
                            type="password"
                            aria-invalid={fieldState.invalid}
                          />
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )}
                    />
                  </div>
                )}
              </>
            ) : membership?.email ? (
              <Field>
                <FieldLabel htmlFor="membership-email-readonly">Email</FieldLabel>
                <Input id="membership-email-readonly" value={membership.email} disabled />
              </Field>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
              <Controller
                control={form.control}
                name="role"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Role</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={fieldState.invalid}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="membership-name">Nome</FieldLabel>
                    <Input
                      {...field}
                      id="membership-name"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="membership-phone">Telefone</FieldLabel>
                    <Input
                      {...field}
                      id="membership-phone"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="active"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Estado</FieldLabel>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant={field.value ? "default" : "outline"}
                      className={field.value ? "bg-[#215442] text-white hover:bg-[#183b2f]" : ""}
                      onClick={() => field.onChange(true)}
                    >
                      Ativo
                    </Button>
                    <Button
                      type="button"
                      variant={!field.value ? "default" : "outline"}
                      className={!field.value ? "bg-[#7a3126] text-white hover:bg-[#61271e]" : ""}
                      onClick={() => field.onChange(false)}
                    >
                      Inativo
                    </Button>
                  </div>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="team_ids"
              render={({ fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Equipas</FieldLabel>
                  {teams.length ? (
                    <div className="flex flex-wrap gap-2">
                      {teams.map((team) => {
                        const selected = selectedTeamIds.includes(team.id)
                        return (
                          <Button
                            key={team.id}
                            type="button"
                            variant={selected ? "default" : "outline"}
                            className={selected ? "bg-[#215442] text-white hover:bg-[#183b2f]" : ""}
                            onClick={() => toggleTeamSelection(team.id)}
                          >
                            {team.name}
                          </Button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#dfd7c0] px-4 py-3 text-sm text-muted-foreground">
                      Ainda nao existem equipas nesta empresa.
                    </div>
                  )}
                  <FieldError errors={[fieldState.error]} />
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
                    : "Adicionar membership"}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
