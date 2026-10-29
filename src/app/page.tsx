import { redirect } from "next/navigation";
import { getActor } from "@/lib/session";

export default async function IndexPage() {
  const actor = await getActor();
  
  if (!actor) {
    redirect("/login");
  }

  // Redirect based on role
  switch (actor.role) {
    case "CENTER_OWNER":
    case "BRANCH_MANAGER":
    case "SECRETARY":
      redirect("/center");
    case "TEACHER":
      redirect("/teacher/dashboard");
    case "STUDENT":
      redirect("/student/dashboard");
    case "PARENT":
      redirect("/parent/dashboard");
    case "SUPER_ADMIN":
      redirect("/admin");
    default:
      redirect("/");
  }
}
