"use client";
import { Category } from "@prisma/client";
import React from "react";
import {
  FcEngineering,
  FcFilmReel,
  FcMultipleDevices,
  FcBusiness,
  FcOldTimeCamera,
  FcSalesPerformance,
  FcSportsMode,
} from "react-icons/fc";
import { IconType } from "react-icons";

import CaterogyItem from "./category-item";

const iconMap: Record<Category["name"], IconType> = {
  Business: FcBusiness,
  Photography: FcOldTimeCamera,
  Fitness: FcSportsMode,
  Accounting: FcSalesPerformance,
  "Computer Science": FcMultipleDevices,
  Filming: FcFilmReel,
  Engineering: FcEngineering,
};

interface CategoriesProps {
  items: Category[];
}
const Categories = ({ items }: CategoriesProps) => {
  return (
    <div className="flex items-center gap-x-2 overflow-auto pb-2">
      {items.map((item) => (
        <CaterogyItem
          key={item.id}
          label={item.name}
          icon={iconMap[item.name]}
          value={item.id}
        />
      ))}
    </div>
  );
};

export default Categories;
