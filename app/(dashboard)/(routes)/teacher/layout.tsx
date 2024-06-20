import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const TeacherLayout = ({ children }: { children: React.ReactNode }) => {
  const { userId } = auth();

  // protect teacher routes
  if (!isTeacher(userId)) return redirect("/");

  return <>{children}</>;
};
export default TeacherLayout;
