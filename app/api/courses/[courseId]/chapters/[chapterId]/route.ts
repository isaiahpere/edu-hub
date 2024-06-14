import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";

import { db } from "@/lib/db";

const muxTokenId = process.env.MUX_TOKEN_ID!;
const muxTokenSecret = process.env.MUX_TOKEN_SECRET!;

const { video } = new Mux({ tokenId: muxTokenId, tokenSecret: muxTokenSecret });

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
