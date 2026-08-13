const { initializeApp, cert } = require("firebase-admin/app");

const { getFirestore } = require("firebase-admin/firestore");

const path = require("path");

const serviceAccount = require(
  path.join(__dirname, "caffora-1c2a1-firebase-adminsdk-fbsvc-69fc1af51a.json"),
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const cafes = [
  {
    name: "The Brew Room",
    description:
      "A cozy café serving handcrafted coffee, breakfast, and delicious food.",
    location: "Connaught Place",
    address: "B-45, Inner Circle, Connaught Place",
    city: "New Delhi",
    latitude: 28.6315,
    longitude: 77.2167,
    rating: 4.6,
    reviewCount: 248,
    priceRange: "₹₹",
    category: "Coffee",
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 98765 43210",
    openingHours: {
      monday: "8:00 AM - 11:00 PM",
      tuesday: "8:00 AM - 11:00 PM",
      wednesday: "8:00 AM - 11:00 PM",
      thursday: "8:00 AM - 11:00 PM",
      friday: "8:00 AM - 11:00 PM",
      saturday: "8:00 AM - 11:30 PM",
      sunday: "8:00 AM - 11:30 PM",
    },
    amenities: ["Wi-Fi", "Outdoor Seating", "Power Outlets"],
    atmosphere: ["Cozy", "Quiet", "Work Friendly"],
    featured: true,
  },

  {
    name: "Blue Tokai Coffee",
    description:
      "Specialty coffee, fresh food, and a relaxed modern atmosphere.",
    location: "Malviya Nagar",
    address: "Select City Road, Malviya Nagar",
    city: "New Delhi",
    latitude: 28.5288,
    longitude: 77.2167,
    rating: 4.5,
    reviewCount: 312,
    priceRange: "₹₹",
    category: "Specialty",
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 98765 12345",
    openingHours: {
      monday: "7:30 AM - 10:30 PM",
      tuesday: "7:30 AM - 10:30 PM",
      wednesday: "7:30 AM - 10:30 PM",
      thursday: "7:30 AM - 10:30 PM",
      friday: "7:30 AM - 11:00 PM",
      saturday: "7:30 AM - 11:00 PM",
      sunday: "7:30 AM - 11:00 PM",
    },
    amenities: ["Wi-Fi", "Specialty Coffee", "Breakfast"],
    atmosphere: ["Modern", "Work Friendly"],
    featured: true,
  },

  {
    name: "Third Wave Coffee",
    description:
      "A modern neighborhood café with specialty coffee, snacks, and comfortable seating.",
    location: "Saket",
    address: "Select Citywalk, Saket",
    city: "New Delhi",
    latitude: 28.5287,
    longitude: 77.219,
    rating: 4.4,
    reviewCount: 189,
    priceRange: "₹₹",
    category: "Coffee",
    image:
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 98765 55555",
    openingHours: {
      monday: "8:00 AM - 10:00 PM",
      tuesday: "8:00 AM - 10:00 PM",
      wednesday: "8:00 AM - 10:00 PM",
      thursday: "8:00 AM - 10:00 PM",
      friday: "8:00 AM - 11:00 PM",
      saturday: "8:00 AM - 11:00 PM",
      sunday: "8:00 AM - 11:00 PM",
    },
    amenities: ["Wi-Fi", "Air Conditioning", "Power Outlets"],
    atmosphere: ["Modern", "Cozy"],
    featured: true,
  },

  {
    name: "Roastery Coffee House",
    description:
      "A beautiful specialty coffee house known for freshly roasted beans and brunch.",
    location: "Hauz Khas",
    address: "Hauz Khas Village, New Delhi",
    city: "New Delhi",
    latitude: 28.5494,
    longitude: 77.2001,
    rating: 4.7,
    reviewCount: 421,
    priceRange: "₹₹₹",
    category: "Specialty",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 98765 77777",
    openingHours: {
      monday: "8:00 AM - 11:00 PM",
      tuesday: "8:00 AM - 11:00 PM",
      wednesday: "8:00 AM - 11:00 PM",
      thursday: "8:00 AM - 11:00 PM",
      friday: "8:00 AM - 11:30 PM",
      saturday: "8:00 AM - 11:30 PM",
      sunday: "8:00 AM - 11:30 PM",
    },
    amenities: ["Wi-Fi", "Outdoor Seating", "Brunch"],
    atmosphere: ["Cozy", "Outdoor", "Romantic"],
    featured: true,
  },

  {
    name: "Third Culture Café",
    description:
      "A stylish café offering specialty drinks, desserts, and a calm space to relax.",
    location: "Vasant Kunj",
    address: "Vasant Kunj, New Delhi",
    city: "New Delhi",
    latitude: 28.5245,
    longitude: 77.157,
    rating: 4.5,
    reviewCount: 167,
    priceRange: "₹₹",
    category: "Desserts",
    image:
      "https://images.unsplash.com/photo-1511081692775-05d0f180a065?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1511081692775-05d0f180a065?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 98765 88888",
    openingHours: {
      monday: "10:00 AM - 10:00 PM",
      tuesday: "10:00 AM - 10:00 PM",
      wednesday: "10:00 AM - 10:00 PM",
      thursday: "10:00 AM - 10:00 PM",
      friday: "10:00 AM - 11:00 PM",
      saturday: "10:00 AM - 11:00 PM",
      sunday: "10:00 AM - 11:00 PM",
    },
    amenities: ["Wi-Fi", "Desserts", "Air Conditioning"],
    atmosphere: ["Modern", "Quiet"],
    featured: false,
  },

  {
    name: "Starbucks",
    description:
      "A familiar café experience with coffee, pastries, snacks, and comfortable seating.",
    location: "Select Citywalk",
    address: "Select Citywalk Mall, Saket",
    city: "New Delhi",
    latitude: 28.5285,
    longitude: 77.2195,
    rating: 4.3,
    reviewCount: 524,
    priceRange: "₹₹₹",
    category: "Bakery",
    image:
      "https://images.unsplash.com/photo-1579888944880-d98341245702?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1579888944880-d98341245702?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 98765 99999",
    openingHours: {
      monday: "8:00 AM - 10:00 PM",
      tuesday: "8:00 AM - 10:00 PM",
      wednesday: "8:00 AM - 10:00 PM",
      thursday: "8:00 AM - 10:00 PM",
      friday: "8:00 AM - 11:00 PM",
      saturday: "8:00 AM - 11:00 PM",
      sunday: "8:00 AM - 11:00 PM",
    },
    amenities: ["Wi-Fi", "Air Conditioning", "Power Outlets"],
    atmosphere: ["Modern", "Work Friendly"],
    featured: false,
  },

  {
    name: "Café Delhi Heights",
    description:
      "A lively all-day café serving comfort food, coffee, desserts, and brunch.",
    location: "Aerocity",
    address: "Worldmark, Aerocity, New Delhi",
    city: "New Delhi",
    latitude: 28.5562,
    longitude: 77.1,
    rating: 4.4,
    reviewCount: 296,
    priceRange: "₹₹₹",
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 98765 11111",
    openingHours: {
      monday: "9:00 AM - 11:00 PM",
      tuesday: "9:00 AM - 11:00 PM",
      wednesday: "9:00 AM - 11:00 PM",
      thursday: "9:00 AM - 11:00 PM",
      friday: "9:00 AM - 11:30 PM",
      saturday: "9:00 AM - 11:30 PM",
      sunday: "9:00 AM - 11:30 PM",
    },
    amenities: ["Wi-Fi", "Outdoor Seating", "Parking"],
    atmosphere: ["Lively", "Modern", "Family Friendly"],
    featured: false,
  },

  {
    name: "Greenr Café",
    description:
      "A healthy modern café focused on fresh food, plant-based options, and great coffee.",
    location: "Saket",
    address: "Saket District Centre, New Delhi",
    city: "New Delhi",
    latitude: 28.524,
    longitude: 77.206,
    rating: 4.5,
    reviewCount: 205,
    priceRange: "₹₹₹",
    category: "Healthy",
    image:
      "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 98765 22222",
    openingHours: {
      monday: "9:00 AM - 10:00 PM",
      tuesday: "9:00 AM - 10:00 PM",
      wednesday: "9:00 AM - 10:00 PM",
      thursday: "9:00 AM - 10:00 PM",
      friday: "9:00 AM - 10:30 PM",
      saturday: "9:00 AM - 10:30 PM",
      sunday: "9:00 AM - 10:30 PM",
    },
    amenities: ["Wi-Fi", "Vegan Options", "Outdoor Seating"],
    atmosphere: ["Modern", "Quiet", "Healthy"],
    featured: false,
  },

  {
    name: "Diggin",
    description:
      "A charming garden-style café with Italian food, coffee, desserts, and beautiful outdoor seating.",
    location: "Anand Lok",
    address: "Anand Lok, New Delhi",
    city: "New Delhi",
    latitude: 28.559,
    longitude: 77.223,
    rating: 4.6,
    reviewCount: 389,
    priceRange: "₹₹₹",
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 98765 33333",
    openingHours: {
      monday: "11:00 AM - 11:00 PM",
      tuesday: "11:00 AM - 11:00 PM",
      wednesday: "11:00 AM - 11:00 PM",
      thursday: "11:00 AM - 11:00 PM",
      friday: "11:00 AM - 11:30 PM",
      saturday: "10:00 AM - 11:30 PM",
      sunday: "10:00 AM - 11:30 PM",
    },
    amenities: ["Wi-Fi", "Outdoor Seating", "Parking"],
    atmosphere: ["Romantic", "Outdoor", "Cozy"],
    featured: true,
  },

  {
    name: "Kunafa House Café",
    description:
      "A dessert-focused café serving coffee, Middle Eastern sweets, and delicious kunafa.",
    location: "Greater Kailash",
    address: "M Block Market, Greater Kailash",
    city: "New Delhi",
    latitude: 28.549,
    longitude: 77.238,
    rating: 4.4,
    reviewCount: 142,
    priceRange: "₹₹",
    category: "Desserts",
    image:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 98765 44444",
    openingHours: {
      monday: "12:00 PM - 11:00 PM",
      tuesday: "12:00 PM - 11:00 PM",
      wednesday: "12:00 PM - 11:00 PM",
      thursday: "12:00 PM - 11:00 PM",
      friday: "12:00 PM - 12:00 AM",
      saturday: "12:00 PM - 12:00 AM",
      sunday: "12:00 PM - 11:00 PM",
    },
    amenities: ["Wi-Fi", "Desserts", "Air Conditioning"],
    atmosphere: ["Cozy", "Modern", "Quiet"],
    featured: false,
  },
];

async function seedCafes() {
  console.log("Starting café seed...");

  const batch = db.batch();
  const cafesRef = db.collection("cafes");

  for (const cafe of cafes) {
    const cafeRef = cafesRef.doc();

    batch.set(cafeRef, {
      ...cafe,
      createdAt: new Date(),
    });
  }

  await batch.commit();

  console.log(`✅ Successfully added ${cafes.length} cafés to Firestore.`);
}

seedCafes()
  .then(() => {
    console.log("✅ Seed completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  });
