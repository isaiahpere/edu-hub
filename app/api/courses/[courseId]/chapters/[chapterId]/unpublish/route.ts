import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthoried", { status: 401 });

    const currentOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId,
      },
    });
    if (!currentOwner) return new NextResponse("Unauthorized", { status: 401 });

    let chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
    });

    if (!chapter || !chapter.isPublished) {
      return new NextResponse("Unable to unpublish chapter", { status: 401 });
    }

    const updatedChapter = await db.chapter.update({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
      data: {
        isPublished: false,
      },
    });

    // Check if there are no published chapters.
    // if no then we need to unpublish the entire course
    const publishedChaptersInCourse = await db.chapter.findMany({
      where: {
        courseId: params.courseId,
        isPublished: true,
      },
    });

    if (!publishedChaptersInCourse.length) {
      await db.course.update({
        where: {
          id: params.courseId,
        },
        data: {
          isPublished: false,
        },
      });
    }

    return NextResponse.json({ updatedChapter });
  } catch (error) {
    console.log("[ERROR_UNPUBLISHING_CHAPTER]", error);
    return new NextResponse("Error publishing the chapter", { status: 500 });
  }
}
