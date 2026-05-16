import { Star, Play, Plus, Check } from 'lucide-react';
import { Drama } from '@/data/dramas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useList } from '@/hooks/use-list';
import { useDramaModal } from '@/hooks/use-drama-modal';
import { Link } from 'react-router-dom';

interface DramaCardProps {
  drama: Drama;
  variant?: 'default' | 'compact';
  index?: number;
}

const DramaCard = ({ drama, variant = 'default', index = 0 }: DramaCardProps) => {
  const { addToMyList, removeFromMyList, isInList } = useList();
  const { openModal } = useDramaModal();
  const isAdded = isInList(drama.id);
  const dramaUrl = `/drama/${drama.slug || drama.id}`;

  const toggleList = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdded) {
      removeFromMyList(drama.id);
    } else {
      addToMyList(drama);
    }
  };

  if (variant === 'compact') {
    return (
      <Link
        to={dramaUrl}
        className="group/card flex gap-3 p-2 rounded-xl hover:bg-muted transition-all duration-300 cursor-pointer animate-fade-in"
        style={{ animationDelay: `${index * 50}ms` }}
        onClick={(e) => {
          // Only open modal if it's a mobile/specific context? 
          // For now, let the link handle it or keep modal for quick view.
          // If we want modal, we can e.preventDefault() but that hurts SEO.
          // Let's allow the Link to work.
        }}
      >
        <div className="relative w-24 h-14 rounded-md overflow-hidden flex-shrink-0 group-hover/card:shadow-[0_0_15px_rgba(51,153,255,0.2)] transition-shadow">
          <img
            src={drama.image}
            alt={drama.title}
            className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-foreground/90 text-sm truncate group-hover/card:text-primary transition-colors">
              {drama.title}
            </h4>
            <button
              onClick={toggleList}
              className={`p-1 rounded-full transition-all duration-300 ${isAdded ? 'text-primary scale-110' : 'text-muted-foreground/40 hover:text-foreground hover:scale-110'}`}
            >
              {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] font-bold text-primary">
              {drama.siteRating && drama.siteRating > 0 ? drama.siteRating : drama.rating} Rating
            </span>
            {drama.siteRating && drama.siteRating > 0 && drama.rating > 0 && (
              <span className="text-[10px] text-muted-foreground/60">IMDb {drama.rating}</span>
            )}
            <span className="text-[11px] text-muted-foreground">{drama.year}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={dramaUrl}
      className="group/card relative flex flex-col gap-2 transition-all duration-300 cursor-pointer animate-fade-in pb-4"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image Container 16:9 */}
      <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-muted">
        <img
          src={drama.image}
          alt={drama.title}
          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full glass border-white/20 flex items-center justify-center transform scale-75 group-hover/card:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {drama.status === 'airing' && (
            <Badge className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-tight h-5">
              On Air
            </Badge>
          )}
        </div>

        {/* Action Button (Watchlist) */}
        <button
          onClick={toggleList}
          className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-background/40 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-background/60"
        >
          {isAdded ? <Check className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-white" />}
        </button>
      </div>

      {/* Info Content */}
      <div className="flex flex-col gap-0.5 mt-1 px-1">
        <h3 className="font-bold text-[15px] text-foreground line-clamp-1 transition-colors group-hover/card:text-primary">
          {drama.title}
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-primary text-primary" />
            <span className="text-xs font-bold text-foreground">
              {drama.siteRating && drama.siteRating > 0 ? drama.siteRating : drama.rating}
            </span>
          </div>
          {drama.siteRating && drama.siteRating > 0 && drama.rating > 0 && (
            <span className="text-[10px] text-muted-foreground">IMDb {drama.rating}</span>
          )}
          <span className="text-xs text-muted-foreground font-medium tracking-tight">
            {drama.year} {drama.episodes > 1 ? `• ${drama.episodes} Eps` : ''}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default DramaCard;
