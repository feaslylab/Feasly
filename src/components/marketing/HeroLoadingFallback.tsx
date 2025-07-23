
import { Skeleton } from "@/components/ui/skeleton";

export function HeroLoadingFallback() {
  return (
    <div className="text-center relative z-10 animate-pulse">
      {/* Typewriter subtitle skeleton */}
      <div className="mb-4">
        <Skeleton className="h-6 w-80 mx-auto bg-primary/20" />
      </div>

      {/* Main title skeleton */}
      <div className="mb-6 space-y-4">
        <Skeleton className="h-16 w-96 mx-auto bg-gradient-to-r from-primary/20 to-primary-light/20" />
        <Skeleton className="h-16 w-80 mx-auto bg-gradient-to-r from-primary/20 to-primary-light/20" />
      </div>

      {/* Description skeleton */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-6 w-full max-w-3xl mx-auto bg-muted-foreground/20" />
        <Skeleton className="h-6 w-4/5 max-w-2xl mx-auto bg-muted-foreground/20" />
      </div>

      {/* CTA buttons skeleton */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Skeleton className="h-14 w-48 bg-primary/20" />
        <Skeleton className="h-14 w-48 bg-border/20" />
      </div>
    </div>
  );
}
