import { Heart } from 'lucide-react';
import logo from '@/assets/logo.png';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    browse: [
      { label: 'Explore', href: '/top-rated' },
      { label: 'Airing', href: '/#airing' },
      // { label: 'Upcoming', href: '#' }, // Removed or keep as placeholder? Keeping simple for now based on file content usually strings
      // Wait, original was array of strings. I need to change structure or logic.
      // Original: 
      // browse: ['Explore', 'Airing', 'Upcoming', 'Top Classics'],
      // account: ['Dashboard', 'Profile', 'My List', 'History'],
      // legal: ['Terms', 'Privacy', 'Cookie Policy', 'Help Center'],
      // And mapped: {links.map((link) => <a href="#">{link}</a>)}

      // I should change logic to support hrefs.
    ],
    // Let's refactor the whole object to include hrefs.
  };

  const footerSections = [
    {
      title: 'browse',
      links: [
        { label: 'Explore', href: '/top-rated' },
        { label: 'Airing', href: '/#airing' },
        // Upcoming and Top Classics might not have specific pages yet, point to Explore?
        { label: 'Upcoming', href: '/top-rated?status=upcoming' },
        { label: 'Top Classics', href: '/top-rated?sort=rating' },
      ]
    },
    {
      title: 'account',
      links: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Profile', href: '/profile' },
        { label: 'My List', href: '/dashboard' },
        // History? Maybe profile?
        { label: 'History', href: '/profile' },
      ]
    },
    {
      title: 'legal',
      links: [
        { label: 'Terms', href: '/terms' },
        { label: 'Privacy', href: '/privacy' },
        { label: 'Cookie Policy', href: '/cookie-policy' },
        { label: 'Help Center', href: '/contact' }, // Mapping Help Center to Contact Us for now
      ]
    }
  ];

  return (
    <footer className="bg-background border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <span className="font-display text-xl font-bold tracking-tighter text-primary">
                MeriDramaList
              </span>
            </Link>
            <p className="text-muted-foreground text-[14px] leading-relaxed max-w-xs capitalize italic">
              Experience the best of Pakistani dramas in a cinematic environment. Tracking, exploring, and sharing your favorites.
            </p>
          </div>

          {/* Links Grid */}
          {footerSections.map((section) => (
            <div key={section.title} className="col-span-1">
              <h4 className="font-bold text-foreground text-sm uppercase tracking-[0.2em] mb-6">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-muted-foreground/30 text-xs font-medium uppercase tracking-widest">
            © {currentYear} MERIDRAMALIST. PREMIUM CINEMATIC EXPERIENCE.
          </p>
          <div className="flex items-center gap-6">
            <p className="text-muted-foreground/30 text-xs flex items-center gap-2">
              Made for the culture <Heart className="w-3 h-3 fill-primary text-primary" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
