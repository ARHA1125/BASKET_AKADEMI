// Tremor Dialog [v0.0.1]

import * as DialogPrimitives from "@radix-ui/react-dialog"
import * as React from "react"

import { cx, focusRing } from "@/lib/utils"


const Dialog = (
  props: React.ComponentPropsWithoutRef<typeof DialogPrimitives.Root>,
) => {
  return <DialogPrimitives.Root tremor-id="tremor-raw" {...props} />
}
Dialog.displayName = "Dialog"

const DialogTrigger = DialogPrimitives.Trigger
DialogTrigger.displayName = "Dialog.Trigger"

const DialogClose = DialogPrimitives.Close
DialogClose.displayName = "Dialog.Close"

const DialogPortal = DialogPrimitives.Portal
DialogPortal.displayName = "DialogPortal"

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitives.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitives.Overlay>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DialogPrimitives.Overlay
      ref={forwardedRef}
      className={cx(
        // base
        "fixed inset-0 z-50 overflow-y-auto",
        // background color
        "bg-black/50 backdrop-blur-sm",
        // transition
        "data-[state=open]:animate-dialogOverlayShow data-[state=closed]:animate-hide",
        className,
      )}
      {...props}
      style={{
        animationDuration: "400ms",
        animationFillMode: "backwards",
      }}
    />
  )
})

DialogOverlay.displayName = "DialogOverlay"

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitives.Content>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DialogPortal>
      <DialogOverlay>
        <DialogPrimitives.Content
          ref={forwardedRef}
          className={cx(
            // base
            "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-md border p-6 shadow-xl",
            // border color
            "border-gray-200 dark:border-gray-900",
            // background color
            "bg-white dark:bg-[#090E1A]",
             // transition
            "data-[state=open]:animate-dialogContentShow data-[state=closed]:animate-hide",
            focusRing,
            className,
          )}
          {...props}
        />
      </DialogOverlay>
    </DialogPortal>
  )
})

DialogContent.displayName = "DialogContent"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cx("flex flex-col gap-y-1", className)}
      {...props}
    />
  )
}

DialogHeader.displayName = "Dialog.Header"

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitives.Title>
>(({ className, ...props }, forwardedRef) => (
  <DialogPrimitives.Title
    ref={forwardedRef}
    className={cx(
      // base
      "text-lg font-semibold",
      // text color
      "text-gray-900 dark:text-gray-50",
      className,
    )}
    {...props}
  />
))

DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitives.Description>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DialogPrimitives.Description
      ref={forwardedRef}
      className={cx("text-gray-500 dark:text-gray-500", className)}
      {...props}
    />
  )
})

DialogDescription.displayName = "DialogDescription"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cx(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className,
      )}
      {...props}
    />
  )
}

DialogFooter.displayName = "DialogFooter"

export {
    Dialog, DialogClose,
    DialogContent, DialogDescription,
    DialogFooter, DialogHeader,
    DialogTitle, DialogTrigger
}

