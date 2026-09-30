import { NavMenuItem } from '@/types';

const sub = (category: string, label: string, q = label.toLowerCase()) => ({
  label,
  href: `/shop?category=${category}&q=${encodeURIComponent(q)}`,
});

/**
 * Starter navigation modelled on shop.shajgoj.com. Used by the storefront when
 * the Mega Menu collection is empty, and inserted into MongoDB the first time
 * an admin opens the Mega Menu Builder so it can be edited from the panel.
 *
 * `mega` items render a multi-column flyout: each entry in `items` is a column
 * heading and its `children` are the links underneath.
 */
export const DEFAULT_MENU: NavMenuItem[] = [
  { title: 'Brands', slug: 'brands', type: 'mega', href: '/shop', items: [] },
  {
    title: 'Makeup',
    slug: 'makeup',
    type: 'mega',
    href: '/shop?category=makeup',
    items: [
      {
        label: 'Face',
        href: '/shop?category=makeup&q=face',
        children: [
          sub('makeup', 'Foundation'),
          sub('makeup', 'Primer'),
          sub('makeup', 'Concealer'),
          sub('makeup', 'Compact & Powder', 'powder'),
          sub('makeup', 'Blush'),
          sub('makeup', 'Highlighter'),
        ],
      },
      {
        label: 'Eyes',
        href: '/shop?category=makeup&q=eye',
        children: [
          sub('makeup', 'Kajal'),
          sub('makeup', 'Eyeliner'),
          sub('makeup', 'Mascara'),
          sub('makeup', 'Eyeshadow'),
          sub('makeup', 'Eyebrow'),
        ],
      },
      {
        label: 'Lips',
        href: '/shop?category=makeup&q=lip',
        children: [
          sub('makeup', 'Lipstick'),
          sub('makeup', 'Liquid Lipstick', 'liquid'),
          sub('makeup', 'Lip Gloss', 'gloss'),
          sub('makeup', 'Lip Liner', 'liner'),
          sub('makeup', 'Lip Balm', 'balm'),
        ],
      },
      {
        label: 'Nails & Tools',
        href: '/shop?category=makeup&q=nail',
        children: [
          sub('makeup', 'Nail Polish', 'nail'),
          sub('makeup', 'Makeup Brushes', 'brush'),
          sub('makeup', 'Sponges & Blenders', 'sponge'),
          sub('makeup', 'Makeup Remover', 'remover'),
        ],
      },
    ],
  },
  {
    title: 'Skin',
    slug: 'skin-care',
    type: 'mega',
    href: '/shop?category=skin-care',
    items: [
      {
        label: 'Cleansers',
        href: '/shop?category=skin-care&q=cleanser',
        children: [
          sub('skin-care', 'Face Wash', 'wash'),
          sub('skin-care', 'Cleansing Oil & Balm', 'cleansing'),
          sub('skin-care', 'Micellar Water', 'micellar'),
          sub('skin-care', 'Scrubs & Exfoliators', 'scrub'),
        ],
      },
      {
        label: 'Treatments',
        href: '/shop?category=skin-care&q=serum',
        children: [
          sub('skin-care', 'Serums & Essence', 'serum'),
          sub('skin-care', 'Toner'),
          sub('skin-care', 'Acne Care', 'acne'),
          sub('skin-care', 'Eye Care', 'eye'),
        ],
      },
      {
        label: 'Moisturizers',
        href: '/shop?category=skin-care&q=moisturizer',
        children: [
          sub('skin-care', 'Day Cream', 'cream'),
          sub('skin-care', 'Night Cream', 'night'),
          sub('skin-care', 'Face Oil', 'oil'),
          sub('skin-care', 'Gel Moisturizer', 'gel'),
        ],
      },
      {
        label: 'Sun & Masks',
        href: '/shop?category=skin-care&q=sunscreen',
        children: [
          sub('skin-care', 'Sunscreen'),
          sub('skin-care', 'Sheet Masks', 'mask'),
          sub('skin-care', 'Clay Masks', 'clay'),
        ],
      },
    ],
  },
  {
    title: 'Hair',
    slug: 'hair',
    type: 'mega',
    href: '/shop?category=hair',
    items: [
      {
        label: 'Hair Care',
        href: '/shop?category=hair',
        children: [
          sub('hair', 'Shampoo'),
          sub('hair', 'Conditioner'),
          sub('hair', 'Hair Oil', 'oil'),
          sub('hair', 'Hair Mask', 'mask'),
          sub('hair', 'Hair Serum', 'serum'),
        ],
      },
      {
        label: 'Styling & Color',
        href: '/shop?category=hair&q=styling',
        children: [
          sub('hair', 'Hair Color', 'color'),
          sub('hair', 'Styling Gel & Wax', 'styling'),
          sub('hair', 'Heat Protection', 'heat'),
        ],
      },
    ],
  },
  {
    title: 'Personal Care',
    slug: 'personal-care',
    type: 'dropdown',
    href: '/shop?category=personal-care',
    items: [
      sub('personal-care', 'Body Wash'),
      sub('personal-care', 'Body Lotion', 'lotion'),
      sub('personal-care', 'Deodorant'),
      sub('personal-care', 'Oral Care', 'tooth'),
      sub('personal-care', 'Feminine Care', 'feminine'),
    ],
  },
  { title: 'K-Beauty', slug: 'k-beauty', type: 'link', href: '/shop?category=k-beauty', items: [] },
  { title: 'Fragrance', slug: 'fragrance', type: 'link', href: '/shop?category=fragrance', items: [] },
  { title: 'Mom & Baby', slug: 'mom-and-baby', type: 'link', href: '/shop?category=mom-and-baby', items: [] },
  { title: 'Undergarments', slug: 'undergarments', type: 'link', href: '/shop?category=undergarments', items: [] },
  { title: 'Offers', slug: 'offers', type: 'link', href: '/shop?offer=offers', items: [] },
];
