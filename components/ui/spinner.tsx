import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Spinner({ className, strokeWidth: _sw, ...restProps }: React.ComponentProps<"svg"> & { strokeWidth?: number }) {
  return (
    <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} data-slot="spinner" role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...restProps} />
  )
}

export { Spinner }
