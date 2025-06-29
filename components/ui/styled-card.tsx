import * as React from "react"
import { cn } from "@/lib/utils"

// Este componente cria o efeito de "sombra dura"
const StyledCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    {/* Esta é a "sombra", uma camada preta por baixo */}
    <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 rounded-xl" />
    {/* Este é o card principal, com a borda */}
    <div
      ref={ref}
      className={cn(
        "relative rounded-xl border-2 border-black bg-white",
        className
      )}
      {...props}
    >
      {children}
    </div>
  </div>
))
StyledCard.displayName = "StyledCard"

export { StyledCard }