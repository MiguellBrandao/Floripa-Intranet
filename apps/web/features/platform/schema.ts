import { z } from "zod"

export const platformCompanyFormSchema = z.object({
  name: z.string().trim().min(1, "Indica o nome da empresa."),
  slug: z.string().trim().min(1, "Indica o slug da empresa."),
  logo_path: z.string(),
  favicon_path: z.string(),
  address: z.string().trim().min(1, "Indica a morada."),
  nif: z.string().trim().min(1, "Indica o NIF."),
  mobile_phone: z.string().trim().min(1, "Indica o telemovel."),
  email: z.string().trim().email("Indica um email valido."),
  iban: z.string().trim().min(1, "Indica o IBAN."),
  initial_admin_mode: z.enum(["existing", "new"]),
  initial_admin_user_id: z.string(),
  initial_admin_email: z.string(),
  initial_admin_password: z.string(),
  initial_admin_name: z.string().trim().min(1, "Indica o nome do admin inicial."),
  initial_admin_phone: z.string(),
})

export type PlatformCompanyFormValues = z.infer<typeof platformCompanyFormSchema>

export const platformCompanyFormDefaults: PlatformCompanyFormValues = {
  name: "",
  slug: "",
  logo_path: "",
  favicon_path: "",
  address: "",
  nif: "",
  mobile_phone: "",
  email: "",
  iban: "",
  initial_admin_mode: "existing",
  initial_admin_user_id: "",
  initial_admin_email: "",
  initial_admin_password: "",
  initial_admin_name: "",
  initial_admin_phone: "",
}

export const platformUserFormSchema = z.object({
  email: z.string().trim().email("Indica um email valido."),
  password: z.string(),
  is_super_admin: z.boolean(),
})

export type PlatformUserFormValues = z.infer<typeof platformUserFormSchema>

export const platformUserFormDefaults: PlatformUserFormValues = {
  email: "",
  password: "",
  is_super_admin: false,
}

export const platformMembershipFormSchema = z.object({
  user_mode: z.enum(["existing", "new"]),
  existing_user_id: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.enum(["admin", "employee"]),
  name: z.string().trim().min(1, "Indica o nome do membro."),
  phone: z.string(),
  active: z.boolean(),
  team_ids: z.array(z.string()),
})

export type PlatformMembershipFormValues = z.infer<typeof platformMembershipFormSchema>

export const platformMembershipFormDefaults: PlatformMembershipFormValues = {
  user_mode: "existing",
  existing_user_id: "",
  email: "",
  password: "",
  role: "employee",
  name: "",
  phone: "",
  active: true,
  team_ids: [],
}
