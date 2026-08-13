import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
} from "firebase/firestore";

import { db } from "./config";

/* =========================================================
   TYPES
========================================================= */

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

  createdAt?: unknown;
};

/* =========================================================
   COLLECTION
========================================================= */

const cafesCollection = collection(db, "cafes");

/* =========================================================
   FIRESTORE DOCUMENT -> CAFE
========================================================= */

function mapCafe(id: string, data: Record<string, any>): Cafe {
  return {
    id,

    name: data.name ?? "Unnamed Café",

    description:
      data.description ?? "A beautiful café waiting to be discovered.",

    location: data.location ?? "Unknown location",

    address: data.address ?? "",

    city: data.city ?? "New Delhi",

    latitude: typeof data.latitude === "number" ? data.latitude : 0,

    longitude: typeof data.longitude === "number" ? data.longitude : 0,

    rating:
      typeof data.rating === "number" ? data.rating : Number(data.rating ?? 0),

    reviewCount:
      typeof data.reviewCount === "number"
        ? data.reviewCount
        : Number(data.reviewCount ?? 0),

    priceRange: data.priceRange ?? "₹₹",

    category: data.category ?? "Coffee",

    image:
      data.image ??
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",

    images: Array.isArray(data.images)
      ? data.images
      : data.image
        ? [data.image]
        : [],

    phone: data.phone ?? "",

    openingHours: data.openingHours ?? {},

    amenities: Array.isArray(data.amenities) ? data.amenities : [],

    atmosphere: Array.isArray(data.atmosphere) ? data.atmosphere : [],

    featured: data.featured === true,

    createdAt: data.createdAt,
  };
}

/* =========================================================
   GET ALL CAFES
========================================================= */

export async function getCafes(): Promise<Cafe[]> {
  try {
    /*
      IMPORTANT:

      We intentionally DON'T use orderBy() here.

      That means Firestore doesn't need a composite
      index just to load your cafés.
    */

    const snapshot = await getDocs(query(cafesCollection, limit(100)));

    const cafes = snapshot.docs.map((document) =>
      mapCafe(document.id, document.data()),
    );

    /*
      Sort on the device instead of Firestore.
    */

    cafes.sort((a, b) => b.rating - a.rating);

    return cafes;
  } catch (error) {
    console.error("getCafes error:", error);

    throw error;
  }
}

/* =========================================================
   GET FEATURED CAFES
========================================================= */

export async function getFeaturedCafes(): Promise<Cafe[]> {
  try {
    /*
      We reuse getCafes() instead of doing:

      where("featured", "==", true)
      orderBy("rating", "desc")

      because that combination can require
      a Firestore composite index.
    */

    const cafes = await getCafes();

    return cafes
      .filter((cafe) => cafe.featured)
      .sort((a, b) => b.rating - a.rating);
  } catch (error) {
    console.error("getFeaturedCafes error:", error);

    throw error;
  }
}

/* =========================================================
   GET SINGLE CAFE
========================================================= */

export async function getCafeById(cafeId: string): Promise<Cafe | null> {
  try {
    if (!cafeId) {
      return null;
    }

    const cafeRef = doc(db, "cafes", cafeId);

    const snapshot = await getDoc(cafeRef);

    if (!snapshot.exists()) {
      return null;
    }

    return mapCafe(snapshot.id, snapshot.data());
  } catch (error) {
    console.error("getCafeById error:", error);

    throw error;
  }
}

/* =========================================================
   SEARCH CAFES
========================================================= */

export async function searchCafes(searchText: string): Promise<Cafe[]> {
  const cafes = await getCafes();

  const search = searchText.trim().toLowerCase();

  if (!search) {
    return cafes;
  }

  return cafes.filter((cafe) => {
    return (
      cafe.name.toLowerCase().includes(search) ||
      cafe.location.toLowerCase().includes(search) ||
      cafe.city.toLowerCase().includes(search) ||
      cafe.category.toLowerCase().includes(search) ||
      cafe.description.toLowerCase().includes(search)
    );
  });
}

/* =========================================================
   FILTER CAFES
========================================================= */

export type CafeFilters = {
  category?: string;
  minRating?: number;
  maxPrice?: number;
  featuredOnly?: boolean;
};

export async function filterCafes(filters: CafeFilters = {}): Promise<Cafe[]> {
  const cafes = await getCafes();

  return cafes.filter((cafe) => {
    /* Category */

    if (
      filters.category &&
      filters.category !== "All" &&
      cafe.category.toLowerCase() !== filters.category.toLowerCase()
    ) {
      return false;
    }

    /* Rating */

    if (filters.minRating !== undefined && cafe.rating < filters.minRating) {
      return false;
    }

    /* Featured */

    if (filters.featuredOnly && !cafe.featured) {
      return false;
    }

    /* Price */

    if (filters.maxPrice !== undefined) {
      const priceCount = (cafe.priceRange.match(/₹/g) || []).length;

      if (priceCount > filters.maxPrice) {
        return false;
      }
    }

    return true;
  });
}

/* =========================================================
   GET CAFES BY CATEGORY
========================================================= */

export async function getCafesByCategory(category: string): Promise<Cafe[]> {
  const cafes = await getCafes();

  if (!category || category.toLowerCase() === "all") {
    return cafes;
  }

  return cafes.filter(
    (cafe) => cafe.category.toLowerCase() === category.toLowerCase(),
  );
}
