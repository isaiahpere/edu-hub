import { Category, Chapter, Course } from "@prisma/client";

import { db } from "@/lib/db";
import { getProgress } from "@/actions/get-progress";

type CourseWithProgressWithCategory = Course & {
  category: Category;
  chapters: Chapter[];
  progress: number | null;
};

type DashboardCourses = {
  completedCourses: CourseWithProgressWithCategory[];
  courseInProgress: CourseWithProgressWithCategory[];
};

export const getDashboardCourses = async (
  userId: string
): Promise<DashboardCourses> => {
  try {
    const purchasedCourses = await db.purchase.findMany({
      where: {
        userId,
      },
      select: {
        course: {
          include: {
            category: true,
            chapters: {
              where: {
                isPublished: true,
              },
            },
          },
        },
      },
    });

    // remap courses & add progress
    const courses = purchasedCourses.map(
      (purchase) => purchase.course
    ) as CourseWithProgressWithCategory[];

    for (let course of courses) {
      const progress = await getProgress(userId, course.id);
      course["progress"] = progress;
    }

    // seperate the completed from not completed to return individually
    const completedCourses = courses.filter(
      (course) => course.progress === 100
    );
    const courseInProgress = courses.filter(
      (course) => (course.progress ?? 0) < 100
    );

    return {
      completedCourses,
      courseInProgress,
    };
  } catch (error) {
    console.log("[GET_DASHBOARD_COURSES]", error);
    return {
      completedCourses: [],
      courseInProgress: [],
    };
  }
};
