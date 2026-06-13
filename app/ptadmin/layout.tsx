import type React from "react";

export default function PtAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="pt-admin-official">{children}</div>;
}
