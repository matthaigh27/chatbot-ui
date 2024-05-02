import { IconArrowBarLeft, IconArrowBarRight } from "@tabler/icons-react";

interface Props {
  onClick: any;
  side: "left" | "right";
  isOpen: boolean;
}

export const OpenCloseSidebarButton = ({ onClick, side, isOpen }: Props) => {
  const OpenIcon = side === "right" ? IconArrowBarLeft : IconArrowBarRight;
  const CloseIcon = side === "right" ? IconArrowBarRight : IconArrowBarLeft;

  return (
    <>
      <button
        className={`fixed ${
          side === "right" ? "right-[270px]" : "left-[270px]"
        } z-50 h-7 w-7 hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:${
          side === "right" ? "right-[270px]" : "left-[270px]"
        } sm:h-8 sm:w-8 sm:text-neutral-700`}
        onClick={onClick}
      >
        {isOpen ? <CloseIcon /> : <OpenIcon />}
      </button>{" "}
    </>
  );
};
