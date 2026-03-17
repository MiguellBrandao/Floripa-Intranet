"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getPlatformUserById } from "@/features/platform/api"
import { formatPlatformDate } from "@/features/platform/utils"
import { useAuthStore } from "@/lib/auth/store"

export function PlatformUserDetailPage({
  userId,
}: {
  userId: string
}) {
  const accessToken = useAuthStore((state) => state.accessToken)

  const userQuery = useQuery({
    queryKey: ["platform", "users", "detail", userId, accessToken],
    queryFn: () => getPlatformUserById(accessToken ?? "", userId),
    enabled: Boolean(accessToken && userId),
  })

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

  if (userQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>A carregar utilizador...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (!userQuery.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Utilizador nao encontrado</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const user = userQuery.data

  return (
    <div className="space-y-6">
      <Card className="border-[#dfd7c0] bg-white">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <CardTitle>{user.email}</CardTitle>
              <CardDescription>
                Conta global da plataforma criada em {formatPlatformDate(user.created_at)}.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={user.is_super_admin ? "default" : "secondary"}>
                {user.is_super_admin ? "Super Admin" : "User"}
              </Badge>
              <Button asChild variant="outline">
                <Link href={`/platform/users/${user.id}/edit`}>Editar utilizador</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#dfd7c0] bg-[#fbf8ef] p-4">
            <div className="text-sm text-muted-foreground">Memberships</div>
            <div className="mt-2 text-2xl font-semibold text-[#1f2f27]">
              {user.membership_count}
            </div>
          </div>
          <div className="rounded-2xl border border-[#dfd7c0] bg-[#fbf8ef] p-4">
            <div className="text-sm text-muted-foreground">Permissao global</div>
            <div className="mt-2 text-2xl font-semibold text-[#1f2f27]">
              {user.is_super_admin ? "Super Admin" : "User"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#dfd7c0] bg-[#fbf8ef]">
        <CardHeader>
          <CardTitle>Memberships</CardTitle>
          <CardDescription>
            Empresas onde esta conta tem acesso e o respetivo role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-[#dfd7c0] bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Criada</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.memberships.length ? (
                  user.memberships.map((membership) => (
                    <TableRow key={membership.id}>
                      <TableCell className="font-medium text-[#1f2f27]">
                        {membership.company_name}
                      </TableCell>
                      <TableCell>{membership.name}</TableCell>
                      <TableCell className="capitalize">{membership.role}</TableCell>
                      <TableCell>{membership.active ? "Ativo" : "Inativo"}</TableCell>
                      <TableCell>{formatPlatformDate(membership.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/platform/companies/${membership.company_id}/members`}>
                            Abrir empresa
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Este utilizador ainda nao pertence a nenhuma empresa.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
