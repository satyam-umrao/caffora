import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./config";
import type {
  Cafe,
  CreateCafeInput,
  OpeningHours,
  UpdateCafeInput,
} from "../../types/cafe";

export type { Cafe, CreateCafeInput, OpeningHours, UpdateCafeInput };

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

    priceRange: data.priceRange ?? "₹750 for two",

    category: data.category ?? "Specialty Coffee",

    image:
      data.image ??
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",

    images: Array.isArray(data.images) && data.images.length > 0
      ? data.images
      : data.image
        ? [data.image]
        : ["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb"],

    phone: data.phone ?? "",

    website: data.website || "",

    openingHours: data.openingHours ?? {},

    amenities: Array.isArray(data.amenities) ? data.amenities : [],

    atmosphere: Array.isArray(data.atmosphere) ? data.atmosphere : [],

    featured: data.featured === true,

    ownerId: data.ownerId,

    seatingCapacity:
      typeof data.seatingCapacity === "number" ? data.seatingCapacity : 40,

    availableSeating: Array.isArray(data.availableSeating)
      ? data.availableSeating
      : ["Indoor", "Outdoor / Patio", "Window View", "Quiet Corner"],

    isOpen: data.isOpen !== false,

    isActive: data.isActive !== false,

    createdAt: data.createdAt,

    updatedAt: data.updatedAt,
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

    const snapshot = await getDocs(query(cafesCollection, limit(150)));

    const cafes = snapshot.docs
      .map((document) => mapCafe(document.id, document.data()))
      .filter((cafe) => cafe.isActive !== false);

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
      const match = (cafe.priceRange || "").replace(/,/g, "").match(/\d+/);
      const cost = match ? parseInt(match[0], 10) : 800;

      if (cost > filters.maxPrice) {
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

/* =========================================================
   REAL-TIME SCHEDULE & OPEN / CLOSED EVALUATION
========================================================= */

/**
 * Evaluates whether a cafe is currently open based on today's operating hours and manual toggle.
 * Never claims open if manualIsOpen is false.
 */
export function isCafeOpenNow(
  openingHours?: OpeningHours,
  manualIsOpen?: boolean,
): boolean {
  if (manualIsOpen === false) return false;
  if (!openingHours) return manualIsOpen ?? true;

  const days: (keyof OpeningHours)[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const now = new Date();
  const dayName = days[now.getDay()];
  const hoursStr = openingHours[dayName];
  if (!hoursStr || hoursStr.toLowerCase().includes("closed")) {
    return false;
  }

  const parts = hoursStr.split(/\s*-\s*/);
  if (parts.length !== 2) return manualIsOpen ?? true;

  const parseTime = (t: string) => {
    const m = t.trim().match(/(\d{1,2}):(\d{2})\s*([APap][Mm])/);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const isPM = m[3].toUpperCase() === "PM";
    if (isPM && h < 12) h += 12;
    if (!isPM && h === 12) h = 0;
    return h * 60 + min;
  };

  const openMin = parseTime(parts[0]);
  const closeMin = parseTime(parts[1]);
  if (openMin === null || closeMin === null) return manualIsOpen ?? true;

  const currentMin = now.getHours() * 60 + now.getMinutes();
  if (closeMin > openMin) {
    return currentMin >= openMin && currentMin < closeMin;
  } else {
    // Crosses midnight: e.g. 5:00 PM - 2:00 AM
    return currentMin >= openMin || currentMin < closeMin;
  }
}

/* =========================================================
   CAFE OWNER MARKETPLACE OPERATIONS
========================================================= */

/**
 * Fetch all cafes owned by the authenticated owner.
 */
export async function getOwnerCafes(ownerId: string): Promise<Cafe[]> {
  try {
    if (!ownerId) return [];

    const q = query(cafesCollection, where("ownerId", "==", ownerId));
    const snapshot = await getDocs(q);

    const cafes = snapshot.docs.map((docSnap) =>
      mapCafe(docSnap.id, docSnap.data()),
    );

    // Sort newest first
    cafes.sort((a, b) => {
      const timeA = (a.createdAt as any)?.seconds ? (a.createdAt as any).seconds * 1000 : 0;
      const timeB = (b.createdAt as any)?.seconds ? (b.createdAt as any).seconds * 1000 : 0;
      return timeB - timeA;
    });

    return cafes;
  } catch (error) {
    console.error("getOwnerCafes error:", error);
    return [];
  }
}

/**
 * Create a new cafe listing with ownerId matching the owner's UID.
 */
export async function createCafe(
  input: CreateCafeInput,
  ownerId: string,
): Promise<Cafe> {
  if (!ownerId) {
    throw new Error("UNAUTHORIZED: Missing owner ID");
  }

  const docData = {
    name: input.name.trim(),
    description: input.description.trim(),
    location: input.location.trim(),
    address: input.address.trim(),
    city: input.city.trim(),
    latitude: input.latitude ?? 28.5355,
    longitude: input.longitude ?? 77.3910,
    priceRange: input.priceRange.trim(),
    category: input.category.trim(),
    image: input.image.trim(),
    images: input.images && input.images.length > 0 ? input.images : [input.image.trim()],
    phone: input.phone.trim(),
    website: input.website ? input.website.trim() : "",
    openingHours: input.openingHours || {},
    amenities: input.amenities || [],
    atmosphere: input.atmosphere || [],
    seatingCapacity: Number(input.seatingCapacity) || 40,
    availableSeating: input.availableSeating && input.availableSeating.length > 0
      ? input.availableSeating
      : ["Indoor", "Outdoor / Patio", "Window View", "Quiet Corner"],
    rating: 0,
    reviewCount: 0,
    featured: false,
    ownerId,
    isOpen: input.isOpen !== false,
    isActive: input.isActive !== false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(cafesCollection, docData);

  return {
    id: docRef.id,
    ...docData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Update an existing cafe listing. Enforces owner verification.
 */
export async function updateCafe(
  cafeId: string,
  input: UpdateCafeInput,
  ownerId: string,
): Promise<void> {
  if (!ownerId || !cafeId) {
    throw new Error("UNAUTHORIZED");
  }

  const cafeRef = doc(db, "cafes", cafeId);
  const snap = await getDoc(cafeRef);
  if (!snap.exists()) {
    throw new Error("CAFE_NOT_FOUND");
  }

  const data = snap.data();
  if (data.ownerId !== ownerId) {
    throw new Error("FORBIDDEN: You do not have permission to edit this café.");
  }

  const updateData: Record<string, any> = {
    ...input,
    updatedAt: serverTimestamp(),
  };

  if (input.seatingCapacity !== undefined) {
    updateData.seatingCapacity = Number(input.seatingCapacity);
  }

  await updateDoc(cafeRef, updateData);
}

/**
 * Toggle open / closed status for an owner's cafe.
 */
export async function toggleCafeOpenStatus(
  cafeId: string,
  isOpen: boolean,
  ownerId: string,
): Promise<void> {
  return updateCafe(cafeId, { isOpen }, ownerId);
}

/**
 * Toggle active / deactivated listing status for an owner's cafe.
 */
export async function toggleCafeActiveStatus(
  cafeId: string,
  isActive: boolean,
  ownerId: string,
): Promise<void> {
  return updateCafe(cafeId, { isActive }, ownerId);
}

/**
 * Delete a cafe listing. Enforces owner verification.
 */
export async function deleteCafe(
  cafeId: string,
  ownerId: string,
): Promise<void> {
  if (!ownerId || !cafeId) {
    throw new Error("UNAUTHORIZED");
  }

  const cafeRef = doc(db, "cafes", cafeId);
  const snap = await getDoc(cafeRef);
  if (!snap.exists()) {
    throw new Error("CAFE_NOT_FOUND");
  }

  const data = snap.data();
  if (data.ownerId !== ownerId) {
    throw new Error("FORBIDDEN: You do not have permission to delete this café.");
  }

  await deleteDoc(cafeRef);
}
