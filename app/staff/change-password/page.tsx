import { Suspense } from "react";
import StaffChangePasswordPage from "./StaffChangePasswordPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <StaffChangePasswordPage />
    </Suspense>
  );
}