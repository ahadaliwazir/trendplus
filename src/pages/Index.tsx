import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import TopTenAiringSection from '@/components/TopTenAiringSection';
import TopAiringSection from '@/components/TopAiringSection';
import MyListSection from '@/components/MyListSection';
import UpcomingSection from '@/components/UpcomingSection';
import TopRatedSection from '@/components/TopRatedSection';
import RecommendationsSection from '@/components/RecommendationsSection';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useHomepage } from '@/hooks/use-homepage';

const Index = () => {
  const location = useLocation();
  const {
    isLoading,
    heroDramas,
    featuredAiring,
    airingDramas,
    upcomingDramas,
    topRatedDramas,
    recommendedDramas
  } = useHomepage();

  useEffect(() => {
    if (location.hash) {
      const elem = document.querySelector(location.hash);
      if (elem) {
        setTimeout(() => {
          elem.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <>
      <SEO
        title="Pakistani Drama Hub | Watch Best Pakistani Dramas Online 2026"
        description="Your ultimate source for Pakistani dramas. Watch full episodes of top trending shows like Ishq Murshid, Kabhi Main Kabhi Tum and more. Updated daily with new episodes, reviews and cast info."
        keywords="pakistani drama hub, watch pakistani dramas online, best pakistani dramas 2026, pakistani drama episodes, hum tv dramas, ary digital dramas, geo entertainment, full episodes"
        url="/"
      />

      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="pb-20">
          <HeroSection dramas={heroDramas} isLoading={isLoading} />
          <div className="flex flex-col gap-12 mt-8">
            {/* Top 10 Airing Today - Netflix-style */}
            {(featuredAiring.length > 0 || isLoading) && (
              <TopTenAiringSection dramas={featuredAiring} isLoading={isLoading} />
            )}
            <TopAiringSection dramas={airingDramas} isLoading={isLoading} />
            <MyListSection />
            <TopRatedSection dramas={topRatedDramas} isLoading={isLoading} />
            <UpcomingSection dramas={upcomingDramas} isLoading={isLoading} />
            <RecommendationsSection dramas={recommendedDramas} isLoading={isLoading} />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
