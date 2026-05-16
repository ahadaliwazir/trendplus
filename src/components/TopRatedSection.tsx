import { useTopRatedDramas } from '@/hooks/use-dramas';
import { topRatedDramas as staticTopRatedDramas, Drama } from '@/data/dramas';
import SectionHeader from './SectionHeader';
import DramaRow from './DramaRow';
import { DramaCardSkeleton } from './DramaCardSkeleton';

interface TopRatedSectionProps {
  dramas?: Drama[];
  isLoading?: boolean;
}

const TopRatedSection = ({ dramas = [], isLoading }: TopRatedSectionProps) => {
  const displayDramas = dramas.length > 0 ? dramas : staticTopRatedDramas.slice(0, 15);

  return (
    <section id="top-dramas" className="py-8 relative z-10 px-4">
      <div className="container mx-auto">
        <SectionHeader title="Top Rated Classics" viewAllHref="/top-rated" />

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <DramaCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <DramaRow dramas={displayDramas} />
        )}
      </div>
    </section>
  );
};

export default TopRatedSection;
