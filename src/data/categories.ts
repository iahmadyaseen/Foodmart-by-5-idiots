import { Category, CategorySlug } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    slug: 'fruits',
    name: 'Fruits',
    description: 'Fresh, juicy, organic fruits sourced daily from local orchards and international growers.',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800',
    productCount: 20,
    subcategories: ['Citrus', 'Berries', 'Tropical', 'Melons', 'Stone Fruits']
  },
  {
    id: 'cat-2',
    slug: 'vegetables',
    name: 'Vegetables',
    description: 'Crisp, garden-fresh vegetables and leafy greens for wholesome family meals.',
    image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&q=80&w=800',
    productCount: 20,
    subcategories: ['Leafy Greens', 'Root Vegetables', 'Gourds & Squash', 'Herbs & Alliums']
  },
  {
    id: 'cat-3',
    slug: 'spices-masalas',
    name: 'Spices & Masalas',
    description: 'Aromatic ground spices, whole seeds, and authentic blended masalas for rich flavor.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800',
    productCount: 20,
    subcategories: ['Ground Spices', 'Whole Spices', 'Recipe Mixes', 'Herbs']
  },
  {
    id: 'cat-4',
    slug: 'dairy-eggs',
    name: 'Dairy & Eggs',
    description: 'Farm-fresh milk, artisanal cheeses, rich butter, yogurt, and organic free-range eggs.',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=800',
    productCount: 20,
    subcategories: ['Milk', 'Yogurt & Lassi', 'Butter & Cream', 'Cheese', 'Eggs']
  },
  {
    id: 'cat-5',
    slug: 'bakery-bread',
    name: 'Bakery & Bread',
    description: 'Freshly baked artisanal breads, rolls, croissants, buns, cakes, and sweet treats.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
    productCount: 20,
    subcategories: ['Bread & Buns', 'Croissants & Pastries', 'Cakes & Muffins', 'Cookies & Rusks']
  },
  {
    id: 'cat-6',
    slug: 'meat',
    name: 'Meat',
    description: 'Hygienically cut, prime quality fresh chicken, beef, mutton, and fresh seafood.',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=800',
    productCount: 48,
    subcategories: ['Chicken', 'Beef', 'Mutton', 'Fish', 'Seafood']
  },
  {
    id: 'cat-7',
    slug: 'rice-grains-pulses',
    name: 'Rice, Grains & Pulses',
    description: 'Premium aromatic basmati rice, whole grains, lentils, and nutritious pulses.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
    productCount: 32,
    subcategories: ['Rice', 'Grains', 'Pulses']
  },
  {
    id: 'cat-8',
    slug: 'beverages-drinks',
    name: 'Beverages & Drinks',
    description: 'Refreshing fruit juices, fizzy sodas, chilled milkshakes, coffees, and teas.',
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&q=80&w=800',
    productCount: 30,
    subcategories: ['Juices & Sodas', 'Teas & Coffee', 'Chilled Drinks', 'Energy & Water']
  },
  {
    id: 'cat-9',
    slug: 'snacks',
    name: 'Snacks',
    description: 'Crunchy potato chips, roasted nuts, biscuits, savory crackers, and munchies.',
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=800',
    productCount: 30,
    subcategories: ['Chips & Crackers', 'Nuts & Dried Fruits', 'Biscuits & Cookies', 'Popcorn & Bars']
  },
  {
    id: 'cat-10',
    slug: 'sweets',
    name: 'Sweets',
    description: 'Traditional gulab jamun, rasmalai, mithai, rich chocolates, and decadent desserts.',
    image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&q=80&w=800',
    productCount: 30,
    subcategories: ['Traditional Mithai', 'Chocolates & Cakes', 'Desserts & Halwa', 'Pastries']
  }
];

export const getCategoryBySlug = (slug: CategorySlug): Category | undefined => {
  return CATEGORIES.find(c => c.slug === slug);
};
