import { useUpcomingDramas } from '@/hooks/use-dramas';
import { upcomingDramas as staticUpcomingDramas, Drama } from '@/data/dramas';
import SectionHeader from './SectionHeader';
import DramaRow from './DramaRow';
import { Loader2 } from 'lucide-react';

interface UpcomingSectionProps {
  dramas?: Drama[];
  isLoading?: boolean;
}

const UpcomingSection = ({ dramas = [], isLoading }: UpcomingSectionProps) => {
  const displayDramas = dramas.length > 0 ? dramas : staticUpcomingDramas;

  return (
    <section id="upcoming" className="py-8 relative z-10">
      <div className="container mx-auto">
        <SectionHeader title="Coming Soon" />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <DramaRow dramas={displayDramas} />
        )}
      </div>
    </section>
  );
};

export default UpcomingSection;
