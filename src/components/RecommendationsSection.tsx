import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { recommendationService, RecommendationItem } from '@/services/recommendationService';
import { useAuth } from '@/hooks/auth-context';
import { useRecommendedDramas } from '@/hooks/use-dramas';
import { recommendedDramas, Drama } from '@/data/dramas';
import SectionHeader from './SectionHeader';
import DramaRow from './DramaRow';
import DramaCard from '@/components/DramaCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface RecommendationsSectionProps {
  dramas?: Drama[];
  isLoading?: boolean;
}

const RecommendationsSection = ({ dramas: propsDramas = [], isLoading: propsLoading = false }: RecommendationsSectionProps) => {
  const { isAuthenticated } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [topActors, setTopActors] = useState<{ id: number; name: string; image_url?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [basedOn, setBasedOn] = useState<string>('');
  const [usePersonalized, setUsePersonalized] = useState(false);

  // Fallback to existing hook and static data
  const { dramas: apiDramas, isLoading: hookLoading } = useRecommendedDramas(15);
  const fallbackLoading = propsDramas.length > 0 ? propsLoading : hookLoading;
  const fallbackDramas = propsDramas.length > 0 ? propsDramas : (apiDramas.length > 0 ? apiDramas : recommendedDramas);

  useEffect(() => {
    if (isAuthenticated) {
      loadPersonalizedRecommendations();
    } else {
      setLoading(false);
      setUsePersonalized(false);
    }
  }, [isAuthenticated]);

  const loadPersonalizedRecommendations = async () => {
    setLoading(true);
    try {
      const data = await recommendationService.getRecommendations(15);
      if (data.recommendations.length > 0 && data.basedOn === 'actor_overlap') {
        setRecommendations(data.recommendations);
        setBasedOn(data.basedOn);
        setTopActors(data.topActors || []);
        setUsePersonalized(true);
      } else {
        setUsePersonalized(false);
      }
    } catch (error) {
      console.error('Failed to load personalized recommendations:', error);
      setUsePersonalized(false);
    } finally {
      setLoading(false);
    }
  };

  // If personalized recommendations with actor overlap are available, show enhanced UI
  if (usePersonalized && recommendations.length > 0) {
    return (
      <section className="py-8 relative z-10">
        <div className="container mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                Recommended For You
              </h2>
              {topActors.length > 0 && (
                <p className="text-sm text-white/50">
                  Based on your favorite actors
                </p>
              )}
            </div>
          </div>

          {/* Top Actors */}
          {topActors.length > 0 && (
            <div className="flex items-center gap-4 py-3 px-4 bg-white/5 rounded-xl overflow-x-auto">
              <span className="text-xs text-white/40 uppercase tracking-wide whitespace-nowrap">Your Top Actors:</span>
              <div className="flex gap-3">
                {topActors.slice(0, 5).map(actor => (
                  <div key={actor.id} className="flex items-center gap-2 shrink-0">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={actor.image_url} alt={actor.name} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {actor.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-white/80 whitespace-nowrap">{actor.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drama Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recommendations.slice(0, 10).map((rec, index) => (
              <div key={rec.drama.id} className="space-y-1">
                <DramaCard drama={rec.drama} index={index} />
                {rec.matchingActors.length > 0 && (
                  <p className="text-[10px] text-white/40 px-1 truncate">
                    {rec.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Fallback to original behavior
  return (
    <section className="py-8 relative z-10">
      <div className="container mx-auto">
        <SectionHeader title="Recommended For You" />
        <DramaRow dramas={fallbackDramas} />
      </div>
    </section>
  );
};

export default RecommendationsSection;
