import { useList } from '@/hooks/use-list';
import SectionHeader from './SectionHeader';
import DramaRow from './DramaRow';

const MyListSection = () => {
    const { myList } = useList();

    if (myList.length === 0) return null;

    return (
        <section id="my-list" className="py-8 relative z-10">
            <div className="container mx-auto">
                <SectionHeader title="Your Watchlist" viewAllHref="/dashboard" />
                <DramaRow dramas={myList} />
            </div>
        </section>
    );
};

export default MyListSection;
