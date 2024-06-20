import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { CheckCircle, Clock } from "lucide-react";

import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import CourseList from "@/components/course-list";
import InfoCard from "./_components/info-card";

const Dashboard = async () => {
  const { userId } = auth();
  if (!userId) return redirect("/");

  const { completedCourses, courseInProgress } = await getDashboardCourses(
    userId
  );

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard
          icon={Clock}
          label="In Progress"
          numberOfItems={courseInProgress.length}
        />
        <InfoCard
          icon={CheckCircle}
          label="Completed"
          numberOfItems={completedCourses.length}
          variant="success"
        />
      </div>
      <CourseList items={[...courseInProgress, ...completedCourses]} />
    </div>
  );
};

export default Dashboard;
