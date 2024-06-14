import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";

import { db } from "@/lib/db";

const muxTokenId = process.env.MUX_TOKEN_ID!;
const muxTokenSecret = process.env.MUX_TOKEN_SECRET!;

// Mux Instance
const { video } = new Mux({ tokenId: muxTokenId, tokenSecret: muxTokenSecret });

/**
 * DELETE CHAPTER
 */
export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    //check user
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // check owner
    const currentOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId,
      },
    });
    if (!currentOwner) return new NextResponse("Unauthorized", { status: 401 });

    const chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
    });
    if (!chapter) return new NextResponse("No Chapter Found", { status: 404 });

    // check if chapter has video to delete it from muxData(DB) and MUX.
    if (chapter.videoUrl) {
      const exisitngMuxData = await db.muxData.findFirst({
        where: {
          chapterId: params.chapterId,
        },
      });
      if (exisitngMuxData) {
        await video.assets.delete(exisitngMuxData.assetId);
        await db.muxData.delete({
          where: {
            id: exisitngMuxData.id,
          },
        });
      }
    }

    // Delete Chapter from DB
    const deletedChapter = await db.chapter.delete({
      where: {
        id: params.chapterId,
      },
    });

    // check if chapter deleted was the only published chapter. If yes, unpublished entire course.
    // NOTE: course must have at least 1 chapter published for course to be published.
    const publishedChaptersInCourse = await db.chapter.findMany({
      where: {
        id: params.courseId,
        isPublished: true,
      },
    });
    if (!publishedChaptersInCourse) {
      await db.course.update({
        where: {
          id: params.courseId,
        },
        data: {
          isPublished: false,
        },
      });
    }

    return NextResponse.json(deletedChapter);
  } catch (error) {
    console.log("[CHAPTER_ID_DELETE", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/**
 * UPDATE CHAPTER
 */
export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = await auth();

    const { isPublished, ...values } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const currentOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId,
      },
    });
    if (!currentOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chapter = await db.chapter.update({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
      data: {
        ...values,
      },
    });

    // TODO: Handle video upload
    if (values.videoUrl) {
      const exisitngMuxData = await db.muxData.findFirst({
        where: {
          chapterId: params.chapterId,
        },
      });

      // CLEAN UP EXISITING VIDEO
      if (exisitngMuxData) {
        await video.assets.delete(exisitngMuxData.assetId);
        await db.muxData.delete({
          where: {
            id: exisitngMuxData.id,
          },
        });
      }

      // Create asset in Mux
      const asset = await video.assets.create({
        input: values.videoUrl,
        playback_policy: ["public"],
        test: false,
      });
      // Add asset to DB
      await db.muxData.create({
        data: {
          chapterId: params.chapterId,
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id ?? "",
        },
      });
    }

    debugger;
    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[CHAPTER_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
