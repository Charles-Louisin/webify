import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/app/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & {
    side?: "left" | "right" | "top" | "bottom";
  }
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPrimitive.Portal>
    <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 bg-background p-6 shadow-lg transition ease-in-out",
        {
          "inset-y-0 left-0 h-full w-3/4 border-r": side === "left",
          "inset-y-0 right-0 h-full w-3/4 border-l": side === "right",
          "inset-x-0 top-0 h-96 border-b": side === "top",
          "inset-x-0 bottom-0 h-96 border-t": side === "bottom",
        },
        className
      )}
      {...props}
    >
      {children}
    </SheetPrimitive.Content>
  </SheetPrimitive.Portal>
));

SheetContent.displayName = "SheetContent";

export { Sheet, SheetTrigger, SheetContent, SheetClose }; 