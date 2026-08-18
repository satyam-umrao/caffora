export type OpeningHours = {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
};

export type Cafe = {
  id: string;
  name: string;
  description: string;
  location: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  priceRange: string;
  category: string;
  image: string;
  images: string[];
  phone: string;
  openingHours: OpeningHours;
  amenities: string[];
  atmosphere: string[];
  featured: boolean;
  website?: string;
  createdAt?: unknown;
};

export type CafeFilters = {
  category?: string;
  minRating?: number;
  maxPrice?: number;
  featuredOnly?: boolean;
  openNow?: boolean;
  distance?: number;
};
