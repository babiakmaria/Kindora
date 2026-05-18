import React from 'react';
import {
  TreePine, BookOpen, ChefHat, Recycle, PencilLine, Home,
  Flower2, Film, Leaf, Zap, Palette, Book, Globe, Handshake,
  BarChart2, Sparkles,
  Dumbbell, HeartPulse, Trophy, ShoppingBag, Sun, Shield, Code, Waves,
} from 'lucide-react';

// Map icon name → Lucide component
export const ICON_MAP = {
  TreePine,
  BookOpen,
  ChefHat,
  Recycle,
  PencilLine,
  Home,
  Flower2,
  Film,
  Leaf,
  Zap,
  Palette,
  Book,
  Globe,
  Handshake,
  BarChart2,
  Sparkles,
  Dumbbell,
  HeartPulse,
  Trophy,
  ShoppingBag,
  Sun,
  Shield,
  Code,
  Waves,
};

export const DEFAULT_ICON = 'Leaf';

// Icon picker options — name + suggested background
export const ICON_OPTIONS = [
  { name: 'TreePine',   bg: '#EAF7F0' },
  { name: 'BookOpen',   bg: '#FFF0F5' },
  { name: 'ChefHat',    bg: '#FFF8E1' },
  { name: 'Recycle',    bg: '#EAF7F0' },
  { name: 'PencilLine', bg: '#FFF0F5' },
  { name: 'Home',       bg: '#EAF7F0' },
  { name: 'Flower2',    bg: '#FFF0F5' },
  { name: 'Film',       bg: '#EAF7F0' },
  { name: 'Leaf',       bg: '#EAF7F0' },
  { name: 'Zap',        bg: '#FFF8E1' },
  { name: 'Palette',    bg: '#FFF0F5' },
  { name: 'Book',       bg: '#FFF8E1' },
  { name: 'Globe',      bg: '#EAF7F0' },
  { name: 'Handshake',  bg: '#FFF0F5' },
  { name: 'BarChart2',  bg: '#F0F4FF' },
  { name: 'Sparkles',   bg: '#FFF8E1' },
  { name: 'Dumbbell',   bg: '#FFF8E1' },
  { name: 'HeartPulse', bg: '#FFF0F5' },
  { name: 'Trophy',     bg: '#FFF8E1' },
  { name: 'ShoppingBag',bg: '#FFF8E1' },
  { name: 'Sun',        bg: '#FFFBEA' },
  { name: 'Shield',     bg: '#EAF7F0' },
  { name: 'Code',       bg: '#EEF2FF' },
  { name: 'Waves',      bg: '#EAF7F0' },
];

// bg colour → icon stroke colour
const BG_COLOR_MAP = {
  '#EAF7F0': '#4CAF7D',
  '#FFF0F5': '#FF6B9D',
  '#FFF8E1': '#F59E0B',
  '#F0F4FF': '#6366F1',
};

export const iconColorForBg = (bg) => BG_COLOR_MAP[bg] || '#6B7280';

// Build a convenient name→bg lookup for the modal
export const ICON_BG_MAP = Object.fromEntries(
  ICON_OPTIONS.map(({ name, bg }) => [name, bg])
);

/**
 * Renders the Lucide project icon by name.
 * Falls back to Leaf if the name is unknown or an old emoji string.
 */
export const ProjectIcon = ({ name, size = 20, bg }) => {
  const Icon = ICON_MAP[name] || ICON_MAP[DEFAULT_ICON];
  const color = iconColorForBg(bg);
  return <Icon size={size} color={color} strokeWidth={1.8} />;
};
