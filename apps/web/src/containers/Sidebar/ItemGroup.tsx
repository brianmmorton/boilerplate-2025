import { ChevronRightIcon } from "@heroicons/react/24/solid";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  ListItem,
  Typography,
} from "@material-tailwind/react";
import classNames from "classnames";
import React from "react";

export const ItemGroup = ({
  isActive,
  title,
  icon = null,
  items,
  handleClickGroup,
}: {
  title: string;
  icon?: React.ReactNode;
  isActive: boolean;
  items?: {
    id: number | string;
    title: string;
    isActive: boolean;
    handleClickGroupItem: (id: string | number) => void;
  }[];
  handleClickGroup: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
}) => {
  const headerInner = (
    <div className="flex items-center">
      {icon}
      <div
        className={classNames(
          "w-0.5 h-4 mr-2 rounded-sm transition-colors ease-in-out",
          isActive && "bg-blue-700"
        )}
      />
      <Typography
        color="blue-gray"
        className={classNames(
          "mr-auto font-medium text-md text-blue-gray-700 transition-colors ease-in-out",
          isActive && "text-blue-800"
        )}
      >
        {title}
      </Typography>
    </div>
  );

  if (!items) {
    return <ListItem className="py-4">{headerInner}</ListItem>;
  }

  return (
    <Accordion open={isActive} className="m-0 p-0 mb-2">
      <AccordionHeader
        onClick={(e) => {
          e.stopPropagation();
          handleClickGroup(e);
        }}
        className="border-b-0 m-0 p-0"
      >
        <ListItem className="py-4 w-full">{headerInner}</ListItem>
      </AccordionHeader>
      <AccordionBody className="py-0 m-0">
        {items.map((item) => (
          <div
            className={classNames(
              "p-4 py-3 ml-2 flex items-center font-medium cursor-pointer transition-colors ease-in-out",
              item.isActive ? "text-blue-800" : "text-blue-gray-600"
            )}
            onClick={(e) => {
              e.stopPropagation();
              item.handleClickGroupItem(item.id);
            }}
          >
            <div
              className={classNames(
                "w-1 h-1 mr-2 rounded-full transition-colors ease-in-out",
                item.isActive ? "bg-blue-700" : "bg-blue-gray-200"
              )}
            />
            {item.title}
          </div>
        ))}
      </AccordionBody>
    </Accordion>
  );
};
