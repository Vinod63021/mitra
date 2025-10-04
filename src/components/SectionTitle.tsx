import type { LucideIcon } from 'lucide-react';

interface SectionTitleProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}

export function SectionTitle({ title, description, icon: Icon, className }: SectionTitleProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        {Icon && <Icon className="w-8 h-8 text-primary" />}
        <h1 className="text-4xl font-headline text-foreground">{title}</h1>
      </div>
      {description && <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>}
    </div>
  );
}
