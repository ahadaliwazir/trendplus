import { useAiringDramas } from '@/hooks/use-dramas';
import { airingDramas as staticAiringDramas, Drama } from '@/data/dramas';
import SectionHeader from './SectionHeader';
import DramaRow from './DramaRow';
import { DramaCardSkeleton } from './DramaCardSkeleton';

interface TopAiringSectionProps {
  dramas?: Drama[];
  isLoading?: boolean;
}

const TopAiringSection = ({ dramas = [], isLoading }: TopAiringSectionProps) => {
  const displayDramas = dramas.length > 0 ? dramas : staticAiringDramas;

  return (
    <section id="airing" className="pt-2 pb-8 relative z-10">
      <div className="container mx-auto px-4">
        <SectionHeader title="Airing Now" />

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

export default TopAiringSection;
