import { cn } from "@/lib/utils";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function H1({ children, className, ...props }: HeadingProps) {
  return (
    <h1 className={cn("text-3xl font-bold text-zinc-700", className)} {...props}>
      {children}
    </h1>
  );
}

export function H2({ children, className, ...props }: HeadingProps) {
  return (
    <h2 className={cn("text-2xl font-bold text-zinc-700", className)} {...props}>
      {children}
    </h2>
  );
}

// Add similar components for H3-H6 