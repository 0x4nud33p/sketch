import * as Tooltip from "@radix-ui/react-tooltip";
import { IconButtonWithTooltipProps } from "@/types/index";

export const IconButtonWithTooltip: React.FC<IconButtonWithTooltipProps> = ({
  label,
  children,
}) => (
  <Tooltip.Provider delayDuration={100}>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="bg-white text-black text-xs font-medium px-2 py-1 rounded shadow-lg z-50"
          side="top"
          sideOffset={8}
        >
          {label}
          <Tooltip.Arrow className="fill-white" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);