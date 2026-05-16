import { useState, useEffect, useRef } from 'react';
import { Play, Plus, Check, Star, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drama } from '@/data/dramas';
import { dramaService } from '@/services/dramaService';
import { useList } from '@/hooks/use-list';
import { useDramaModal } from '@/hooks/use-drama-modal';
import { Skeleton } from '@/components/ui/skeleton';

interface HeroSectionProps {
  dramas?: Drama[];
  isLoading?: boolean;
}

const HeroSection = ({ dramas = [], isLoading: propsLoading = false }: HeroSectionProps) => {
  const [featuredDramas, setFeaturedDramas] = useState<Drama[]>(dramas);
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeDrama = featuredDramas[currentIndex] || featuredDramas[0];
  const [imageLoadState, setImageLoadState] = useState<Record<number, 'loading' | 'loaded' | 'error'>>({});
  const [isLoading, setIsLoading] = useState(propsLoading);
  // Touch swipe state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const { addToMyList, removeFromMyList, isInList } = useList();
  const { openModal } = useDramaModal();
  const isAdded = activeDrama ? isInList(activeDrama.id) : false;

  useEffect(() => {
    if (dramas.length > 0) {
      setFeaturedDramas(dramas);
      setIsLoading(false);
    } else {
      setIsLoading(propsLoading);
    }
  }, [dramas, propsLoading]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (featuredDramas.length > 0) {
        setCurrentIndex((prev) => (prev + 1) % featuredDramas.length);
      }
    }, 8000); // Change every 8 seconds for a more cinematic feel
    return () => clearInterval(timer);
  }, [featuredDramas.length]);

  if (isLoading) {
    return (
      <section className="relative w-full h-[60vh] md:h-[85vh] min-h-[500px] md:min-h-[700px] flex items-center overflow-hidden bg-black px-4 lg:px-12">
        <div className="container mx-auto">
          <div className="max-w-2xl space-y-6">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-16 md:h-24 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-14 w-40 rounded-md" />
              <Skeleton className="h-14 w-40 rounded-md" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // Minimum swipe distance in px

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swiped left - go to next
        setCurrentIndex((prev) => (prev + 1) % featuredDramas.length);
      } else {
        // Swiped right - go to previous
        setCurrentIndex((prev) => (prev - 1 + featuredDramas.length) % featuredDramas.length);
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleImageLoad = (dramaId: number) => {
    setImageLoadState(prev => ({ ...prev, [dramaId]: 'loaded' }));
  };

  const handleImageError = (dramaId: number) => {
    setImageLoadState(prev => ({ ...prev, [dramaId]: 'error' }));
  };

  const toggleList = () => {
    if (isAdded) {
      removeFromMyList(activeDrama.id);
    } else {
      addToMyList(activeDrama);
    }
  };

  // Get the best image source for a drama - prefer hero_image_url if available
  const getHeroImageSrc = (drama: Drama) => {
    return drama.hero_image_url || drama.image_url || drama.image;
  };

  // Custom styles for each drama poster - we now favor dynamic DB values
  const getHeroImageStyles = (drama: Drama) => {
    const x = drama.hero_pos_x !== undefined ? drama.hero_pos_x : 50;
    const y = drama.hero_pos_y !== undefined ? drama.hero_pos_y : 10;
    const scale = drama.hero_scale !== undefined ? drama.hero_scale : 1.05;

    return {
      objectPosition: `${x}% ${y}%`,
      transform: `scale(${scale})`,
      transformOrigin: 'center center'
    };
  };


  return (
    <section
      className="relative w-full h-[60vh] md:h-[85vh] min-h-[500px] md:min-h-[700px] flex items-center overflow-hidden bg-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image with Cinematic Fade */}
      <div className="absolute inset-0 z-0">
        {featuredDramas.map((drama, idx) => {
          const imageSrc = getHeroImageSrc(drama);
          const hasError = imageLoadState[drama.id] === 'error';
          const dynamicStyles = getHeroImageStyles(drama);

          return (
            <div
              key={drama.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? 'opacity-100' : 'opacity-0'
                }`}
            >
              {/* Simple dark fallback only shown if image fails */}
              {hasError && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-gray-900 to-black" />
              )}

              {!hasError && (
                <div className="relative h-full overflow-hidden bg-black/40">
                  {/* Blurred background for zoom-out fallback */}
                  <img
                    src={imageSrc}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110"
                  />

                  <img
                    src={imageSrc}
                    alt={drama.title}
                    className="relative w-full h-full object-cover md:object-cover object-[center_20%] md:object-[unset] transition-opacity duration-700"
                    style={dynamicStyles}
                    onLoad={() => handleImageLoad(drama.id)}
                    onError={() => handleImageError(drama.id)}
                  />
                </div>
              )}
              {/* Left side gradient - subtle and dark like Viki */}
              <div className="absolute inset-y-0 left-0 w-[60%] bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              {/* Bottom gradient - deeper dark fade */}
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </div>
          );
        })}
      </div>

      {/* Content Container */}
      <div className="container relative z-10 mx-auto px-4 lg:px-12 pt-20">
        {activeDrama ? (
          <div className="max-w-2xl animate-fade-in" key={activeDrama.id}>
            {/* Maturity Rating - Simplified like Viki */}
            <div className="mb-4">
              <span className="border border-white/40 px-2 py-0.5 rounded-sm text-[11px] font-bold text-white/80">
                {activeDrama.maturityRating || "13+"}
              </span>
            </div>

            {/* Title - Large and Impactful */}
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg tracking-tight">
              {activeDrama.title}
            </h1>

            {/* Metadata - Simplified */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-[14px] font-medium text-white/90">
              <div className="flex items-center gap-1.5 text-white">
                <Star className="w-4 h-4 fill-[#FFD700] text-[#FFD700]" />
                <span className="font-bold">{activeDrama.rating}</span>
              </div>
              <span className="text-white/40">|</span>
              <span>{activeDrama.year}</span>
              <span className="text-white/40">|</span>
              <span>{activeDrama.genre[0]}</span>
              <span className="text-white/40">|</span>
              <span>{activeDrama.episodes} Episodes</span>
            </div>

            {/* Synopsis - Clean */}
            <p className="text-base md:text-lg text-white/80 leading-relaxed mb-8 line-clamp-3 max-w-xl font-light">
              {activeDrama.synopsis}
            </p>

            {/* Action Buttons - Viki Style (Dark) */}
            <div className="flex items-center gap-3">
              <Button className="bg-[#1A1A1A]/90 hover:bg-[#2A2A2A] text-white rounded-md px-10 h-14 font-bold flex items-center gap-3 group transition-all border border-white/10"
                onClick={() => openModal(activeDrama)}>
                <Play className="w-5 h-5 fill-white" />
                <span className="text-lg">Watch</span>
              </Button>

              <Button
                variant="outline"
                className="bg-[#1A1A1A]/40 border-white/20 hover:bg-[#1A1A1A]/60 text-white rounded-md px-8 h-14 font-bold flex items-center gap-2 group transition-all"
                onClick={toggleList}
              >
                {isAdded ? (
                  <Check className="w-5 h-5 text-secondary" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                <span className="text-lg">{isAdded ? 'Added' : 'Watchlist'}</span>
              </Button>
            </div>
          </div>
        ) : !isLoading && (
          <div className="max-w-2xl text-center py-20 text-white/40">
            <Film className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No featured dramas found.</p>
          </div>
        )}
      </div>

      {/* Hero Navigation Indicators */}
      <div className="absolute bottom-10 right-12 z-20 flex gap-1.5">
        {featuredDramas.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-10 bg-[#0070F3]' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
          />
        ))}
      </div>
    </section >
  );
};

export default HeroSection;
