// Fixed homepage banner slot shown directly under the hero slider. Admins edit
// it from Banners & Hero; it starts with the Pond's banner that used to be
// hard-coded on the homepage.
export const UNDER_HERO_BANNER = {
  id: 'under-hero-banner',
  widget_name: 'under_hero_banner',
  title: 'Banner Under Hero',
  columns: 1,
  order: 1,
  isActive: true,
  items: [
    {
      id: 1,
      title: "Pond's Miracle Prime",
      image: 'https://bk.shajgoj.com/storage/2026/08/prime-banner-ponds-miracle-me-web.png',
      url: '/shop?brand=ponds',
      alt: 'Ponds Miracle Prime Banner',
    },
  ],
};

export const UNDER_HERO_RECOMMENDED_SIZE = '1920 × 380 px';

export function isUnderHeroBanner(banner: { id?: unknown; widget_name?: unknown }): boolean {
  return banner.id === UNDER_HERO_BANNER.id || banner.widget_name === UNDER_HERO_BANNER.widget_name;
}
