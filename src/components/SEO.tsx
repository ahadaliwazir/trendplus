import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'video.tv_show';
    drama?: {
        name: string;
        image: string;
        description: string;
        year: number;
        rating?: number;
        episodes?: number;
        genre?: string[];
        cast?: string[];
        channel?: string;
        episodesList?: any[];
    };
    noindex?: boolean;
}

const SITE_NAME = 'MeriDramaList';
const DEFAULT_DESCRIPTION = 'Discover the top Pakistani dramas right now on MeriDramaList. Track the best new releases, read reviews, find cast info, and explore highly-rated shows from Hum TV, ARY, and Geo.';
const DEFAULT_IMAGE = '/og-image.png';
const BASE_URL = 'https://meridramalist.com'; // Update in production

export const SEO = ({
    title,
    description = 'Discover the top Pakistani dramas right now on MeriDramaList. Track the best new releases, read reviews, find cast info, and explore highly-rated shows from Hum TV, ARY, and Geo.',
    keywords = 'top pakistani dramas, best pakistani dramas, new pakistani dramas 2026, latest pakistani dramas, trending dramas, Hum TV, ARY Digital, Geo Entertainment, drama ratings',
    image = DEFAULT_IMAGE,
    url = '',
    type = 'website',
    drama,
    noindex = false,
}: SEOProps) => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Your Ultimate Pakistani Drama Hub`;
    const fullUrl = `${BASE_URL}${url}`;
    const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;

    // Generate JSON-LD structured data
    const getStructuredData = () => {
        const baseData = {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            url: BASE_URL,
            description: DEFAULT_DESCRIPTION,
            potentialAction: {
                '@type': 'SearchAction',
                target: `${BASE_URL}/explore?search={search_term_string}`,
                'query-input': 'required name=search_term_string',
            },
        };

        const breadcrumbs = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: BASE_URL
                }
            ]
        };

        if (drama) {
            // Add drama breadcrumb
            breadcrumbs.itemListElement.push({
                '@type': 'ListItem',
                position: 2,
                name: 'Dramas',
                item: `${BASE_URL}/top-rated`
            });
            breadcrumbs.itemListElement.push({
                '@type': 'ListItem',
                position: 3,
                name: drama.name,
                item: fullUrl
            });

            return [
                {
                    '@context': 'https://schema.org',
                    '@type': 'TVSeries',
                    name: drama.name,
                    image: drama.image,
                    description: drama.description,
                    datePublished: `${drama.year}-01-01`,
                    ...(drama.rating && {
                        aggregateRating: {
                            '@type': 'AggregateRating',
                            ratingValue: drama.rating,
                            bestRating: 10,
                            worstRating: 1,
                        },
                    }),
                    ...(drama.episodes && { numberOfEpisodes: drama.episodes }),
                    ...(drama.genre && { genre: drama.genre }),
                    ...(drama.cast && {
                        actor: drama.cast.map((name) => ({
                            '@type': 'Person',
                            name,
                        })),
                    }),
                    ...(drama.channel && {
                        productionCompany: {
                            '@type': 'Organization',
                            name: drama.channel,
                        },
                    }),
                    countryOfOrigin: {
                        '@type': 'Country',
                        name: 'Pakistan',
                    },
                    // Create rich snippets for episodes if available
                    ...(drama.episodesList && drama.episodesList.length > 0 && {
                        containsSeason: {
                            '@type': 'TVSeason',
                            seasonNumber: 1,
                            numberOfEpisodes: drama.episodes,
                            episode: drama.episodesList.map((ep: any) => ({
                                '@type': 'TVEpisode',
                                episodeNumber: ep.episode_number,
                                name: `Episode ${ep.episode_number}`,
                                image: ep.thumbnail_url || drama.image,
                                datePublished: ep.release_date || `${drama.year}-01-01`,
                                description: `Watch ${drama.name} Episode ${ep.episode_number} Full in HD.`,
                                potentialAction: {
                                    '@type': 'WatchAction',
                                    target: `${BASE_URL}/drama/${url.split('/').pop()}?ep=${ep.episode_number}`
                                }
                            }))
                        }
                    })
                },
                breadcrumbs
            ];
        }

        return [baseData, breadcrumbs];
    };

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={fullUrl} />

            {/* Robots */}
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="en_US" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImage} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(getStructuredData())}
            </script>
        </Helmet>
    );
};

export default SEO;
