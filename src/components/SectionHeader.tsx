import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
}

const SectionHeader = ({ title, subtitle, showViewAll = true, viewAllHref = '#' }: SectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6 px-2 md:px-4">
      <div>
        <h2 className="font-display text-2xl md:text-3xl font-black text-foreground tracking-tight uppercase">
          {title}
        </h2>
        {subtitle && (
          <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
        )}
      </div>
      {showViewAll && (
        <Link to={viewAllHref}>
          <Button variant="ghost" className="text-muted-foreground hover:text-primary gap-1 transition-all group">
            Explore All
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
