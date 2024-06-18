import Image from "next/image";
import Link from "next/link";
import React from "react";
import { BookOpen } from "lucide-react";

import { IconBadge } from "@/components/icon-badge";
import { formatPrice } from "@/lib/format";

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string;
  chaptersLength: number;
  price: number;
  progress: number | null;
  category: string;
}
const CourseCard = ({
  id,
  title,
  imageUrl,
  chaptersLength,
  price,
  progress,
  category,
}: CourseCardProps) => {
  return (
    <div>
      <Link href={`/courses/${id}`}>
        <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full">
          <div className="relative w-full aspect-video rounded-md overflow-hidden">
            <Image src={imageUrl} fill className="object-cover" alt={title} />
          </div>
          <div className="flex flex-col pt-2">
            <div className="text-lg md:text-base font-medium group:hover:text-sky-700 transition line-clamp-2">
              {title}
            </div>
            <p className="text-xs text-muted-foreground">{category}</p>
            <div className="my-3 flex items-center gap-x-2 text-sm md:text-xs">
              <div className="flex items-center gap-x-1 text-slate-500">
                <IconBadge size={"sm"} icon={BookOpen} />
                <span>
                  {chaptersLength} {chaptersLength > 1 ? "Chapters" : "Chapter"}
                </span>
              </div>
            </div>
            {progress !== null ? (
              <div>Pgress Comp</div>
            ) : (
              <p className="text-md md:text-sm font-medium text-slate-700">
                {formatPrice(price)}
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CourseCard;
