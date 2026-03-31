import { cookies, headers } from "next/headers";

export type TenantContext = {
  firmId: string;
  professionalId: string | null;
  professionalEmail: string | null;
  professionalName: string;
  professionalInitials: string;
  professionalPhone: string | null;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return "U";
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export async function getTenantContext(): Promise<TenantContext> {
  const h = await headers();
  const c = await cookies();

  const firmId =
    h.get("x-firm-id") ??
    c.get("firm_id")?.value ??
    process.env.NEXT_PUBLIC_DEFAULT_FIRM_ID ??
    process.env.DEFAULT_FIRM_ID ??
    "demo-firm";

  const professionalId =
    h.get("x-professional-id") ??
    c.get("professional_id")?.value ??
    process.env.DEFAULT_PROFESSIONAL_ID ??
    null;

  const professionalEmail =
    h.get("x-user-email") ??
    c.get("user_email")?.value ??
    process.env.DEFAULT_USER_EMAIL ??
    null;

  const professionalName =
    h.get("x-user-name") ??
    c.get("user_name")?.value ??
    process.env.DEFAULT_USER_NAME ??
    "Usuario";
  const professionalPhone =
    h.get("x-user-phone") ??
    c.get("user_phone")?.value ??
    process.env.DEFAULT_PROFESSIONAL_PHONE ??
    null;

  return {
    firmId,
    professionalId,
    professionalEmail,
    professionalName,
    professionalInitials: getInitials(professionalName),
    professionalPhone,
  };
}
