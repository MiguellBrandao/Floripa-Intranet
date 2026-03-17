"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const labels: Record<string, string> = {
  platform: "Platform",
  companies: "Empresas",
  users: "Utilizadores",
  members: "Membros",
  new: "Novo",
  edit: "Editar",
}

export function PlatformLayoutHeader() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  const current = segments.at(-1) ?? "platform"
  const previous = segments.at(-2)
  const section = segments[1]
  const isCompanies = section === "companies"
  const isUsers = section === "users"
  const isUuid = /^[0-9a-f-]{36}$/i.test(current)

  const currentLabel =
    current === "new" && isCompanies
      ? "Nova empresa"
      : current === "edit" && isCompanies
        ? "Editar empresa"
        : current === "new" && isUsers
          ? "Novo utilizador"
          : current === "edit" && isUsers
            ? "Editar utilizador"
            : current === "members"
              ? "Membros"
              : isUuid && previous === "companies"
                ? "Detalhe da empresa"
                : isUuid && previous === "users"
                  ? "Detalhe do utilizador"
                  : labels[current] ?? current

  const sectionHref =
    section === "companies"
      ? "/platform/companies"
      : section === "users"
        ? "/platform/users"
        : "/platform"

  const sectionLabel = section ? labels[section] ?? section : "Platform"

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1 text-[#215442] hover:bg-[#215442]/8" />
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link href="/platform">Platform</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {section ? (
              <>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link href={sectionHref}>{sectionLabel}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
