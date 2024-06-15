import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

/**
 * To Update chapter from unpublished to published
 * @returns updatedChapter - chapter with isPublished updated to true
 */
export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const currentOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId,
      },
    });
    if (!currentOwner) return new NextResponse("Unathorized", { status: 401 });

    const chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
    });
    const muxData = await db.muxData.findUnique({
      where: {
        chapterId: params.chapterId,
      },
    });
    if (
      !chapter ||
      !chapter.title ||
      !chapter.description ||
      !chapter.videoUrl ||
      !muxData
    ) {
      return new NextResponse("Missing chapter fields", { status: 400 });
    }

    const updatedChapter = await db.chapter.update({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
      data: {
        isPublished: true,
      },
    });
    return NextResponse.json(updatedChapter);
  } catch (error) {
    console.log("[ERROR_PUBLISHING_CHAPTER");
    return new NextResponse("Error Publishing Chapter", { status: 500 });
  }
}
