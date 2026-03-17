"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getPlatformCompanyById } from "@/features/platform/api"
import { useAuthStore } from "@/lib/auth/store"

export function PlatformCompanyDetailPage({
  companyId,
}: {
  companyId: string
}) {
  const accessToken = useAuthStore((state) => state.accessToken)

  const companyQuery = useQuery({
    queryKey: ["platform", "companies", "detail", companyId, accessToken],
    queryFn: () => getPlatformCompanyById(accessToken ?? "", companyId),
    enabled: Boolean(accessToken && companyId),
  })

  if (!accessToken) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sessao em falta</CardTitle>
          <CardDescription>Faz login novamente antes de gerir empresas.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (companyQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>A carregar empresa...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (!companyQuery.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Empresa nao encontrada</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const company = companyQuery.data

  return (
    <div className="space-y-6">
      <Card className="border-[#dfd7c0] bg-white">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <CardTitle>{company.name}</CardTitle>
              <CardDescription>
                {company.slug} · {company.email}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href={`/platform/companies/${company.id}/edit`}>Editar empresa</Link>
              </Button>
              <Button asChild className="bg-[#215442] text-white hover:bg-[#183b2f]">
                <Link href={`/platform/companies/${company.id}/members`}>Gerir membros</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Membros" value={String(company.member_count)} />
          <SummaryCard
            label="Admins ativos"
            value={String(company.active_admin_count)}
          />
          <SummaryCard label="NIF" value={company.nif} />
        </CardContent>
      </Card>

      <Card className="border-[#dfd7c0] bg-[#fbf8ef]">
        <CardHeader>
          <CardTitle>Dados base</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <DetailItem label="Morada" value={company.address} />
          <DetailItem label="Telemovel" value={company.mobile_phone} />
          <DetailItem label="Email" value={company.email} />
          <DetailItem label="IBAN" value={company.iban} />
          <DetailItem label="Logo path" value={company.logo_path ?? "-"} />
          <DetailItem label="Favicon path" value={company.favicon_path ?? "-"} />
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-[#dfd7c0] bg-[#fbf8ef] p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-[#1f2f27]">{value}</div>
    </div>
  )
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="space-y-1 rounded-2xl border border-[#dfd7c0] bg-white p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-[#1f2f27]">{value}</div>
    </div>
  )
}
