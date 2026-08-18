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
  // 1. Blue Tokai Saket
  {
    name: "Blue Tokai Coffee Roasters",
    description:
      "India's premier specialty coffee pioneer featuring single-origin pour-overs, AeroPress brews, artisanal sourdough tartines, and a tranquil leafy courtyard.",
    location: "Champa Gali, Saket",
    address: "Khasra 258, Lane 3, Westend Marg, Saidulajab, Saket",
    city: "New Delhi",
    latitude: 28.5204,
    longitude: 77.2001,
    rating: 4.8,
    reviewCount: 482,
    priceRange: "₹750 for two",
    category: "Specialty Coffee",
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 98211 43210",
    openingHours: {
      monday: "7:30 AM - 10:30 PM",
      tuesday: "7:30 AM - 10:30 PM",
      wednesday: "7:30 AM - 10:30 PM",
      thursday: "7:30 AM - 10:30 PM",
      friday: "7:30 AM - 11:00 PM",
      saturday: "7:30 AM - 11:00 PM",
      sunday: "7:30 AM - 11:00 PM",
    },
    amenities: [
      "High-Speed Wi-Fi",
      "Specialty Manual Brews",
      "Outdoor Garden",
      "Pet Friendly",
      "Power Outlets",
    ],
    atmosphere: ["Aesthetic", "Work Friendly", "Cozy & Quiet"],
    featured: true,
  },

  // 2. Diggin Chanakyapuri
  {
    name: "Diggin Gourmet Café",
    description:
      "A fairy-tale Tuscan garden bistro famous for twinkling fairy lights, rustic exposed brick walls, handmade ravioli, artisan pizzas, and gelato.",
    location: "Chanakyapuri",
    address: "11/12, Santushti Shopping Complex, Chanakyapuri",
    city: "New Delhi",
    latitude: 28.5855,
    longitude: 77.1956,
    rating: 4.7,
    reviewCount: 614,
    priceRange: "₹1,400 for two",
    category: "Italian & Bakery",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 98112 88440",
    openingHours: {
      monday: "11:00 AM - 11:00 PM",
      tuesday: "11:00 AM - 11:00 PM",
      wednesday: "11:00 AM - 11:00 PM",
      thursday: "11:00 AM - 11:00 PM",
      friday: "11:00 AM - 11:30 PM",
      saturday: "11:00 AM - 11:30 PM",
      sunday: "11:00 AM - 11:00 PM",
    },
    amenities: [
      "Outdoor Garden Seating",
      "Valet Parking",
      "Artisan Bakery",
      "Air Conditioning",
    ],
    atmosphere: ["Romantic", "Outdoor Garden", "Aesthetic", "Cozy"],
    featured: true,
  },

  // 3. AMA Café Majnu Ka Tila
  {
    name: "AMA Mountain Café",
    description:
      "A legendary Himalayan mountain retreat in Majnu Ka Tila crafting signature blueberry cheesecakes, fluffy apple cinnamon pancakes, and French-pressed roasts.",
    location: "Majnu Ka Tila",
    address: "House 6, New Camp, Majnu Ka Tila, New Aruna Nagar",
    city: "New Delhi",
    latitude: 28.7037,
    longitude: 77.2274,
    rating: 4.8,
    reviewCount: 890,
    priceRange: "₹650 for two",
    category: "Desserts & Bakery",
    image:
      "https://images.unsplash.com/photo-1511081692775-05d0f180a065?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1511081692775-05d0f180a065?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 98730 45220",
    openingHours: {
      monday: "8:00 AM - 10:00 PM",
      tuesday: "8:00 AM - 10:00 PM",
      wednesday: "8:00 AM - 10:00 PM",
      thursday: "8:00 AM - 10:00 PM",
      friday: "8:00 AM - 10:30 PM",
      saturday: "8:00 AM - 10:30 PM",
      sunday: "8:00 AM - 10:00 PM",
    },
    amenities: [
      "Himalayan Brews",
      "Artisan Pastries",
      "Wi-Fi",
      "Air Conditioning",
    ],
    atmosphere: ["Cozy & Quiet", "Aesthetic", "Vintage Vibe"],
    featured: true,
  },

  // 4. The Grammar Room Mehrauli
  {
    name: "The Grammar Room",
    description:
      "An upscale sunlit boutique café with sweeping glass views of the Mehrauli ridge forest, serving seasonal craft cocktails, truffle brioche toasts, and specialty coffees.",
    location: "Mehrauli",
    address: "6-8, One Style Mile, Kalka Das Marg, Mehrauli",
    city: "New Delhi",
    latitude: 28.5244,
    longitude: 77.1855,
    rating: 4.7,
    reviewCount: 356,
    priceRange: "₹2,200 for two",
    category: "Gourmet Brunch",
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 81302 88558",
    openingHours: {
      monday: "11:00 AM - 11:00 PM",
      tuesday: "11:00 AM - 11:00 PM",
      wednesday: "11:00 AM - 11:00 PM",
      thursday: "11:00 AM - 11:00 PM",
      friday: "11:00 AM - 12:00 AM",
      saturday: "10:30 AM - 12:00 AM",
      sunday: "10:30 AM - 11:00 PM",
    },
    amenities: [
      "Forest View Seating",
      "Craft Cocktails",
      "Valet Parking",
      "Wi-Fi",
    ],
    atmosphere: ["Romantic", "Modern Luxury", "Scenic Views"],
    featured: true,
  },

  // 5. Third Wave GK-2
  {
    name: "Third Wave Coffee Roasters",
    description:
      "Contemporary specialty coffee sanctuary known for custom V60 pour-overs, salted caramel mochas, warm bagels, and ergonomic remote-work benches.",
    location: "Greater Kailash II",
    address: "M-24, M Block Market, Greater Kailash II",
    city: "New Delhi",
    latitude: 28.5355,
    longitude: 77.2433,
    rating: 4.6,
    reviewCount: 310,
    priceRange: "₹750 for two",
    category: "Specialty Coffee",
    image:
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 97118 73200",
    openingHours: {
      monday: "8:00 AM - 11:00 PM",
      tuesday: "8:00 AM - 11:00 PM",
      wednesday: "8:00 AM - 11:00 PM",
      thursday: "8:00 AM - 11:00 PM",
      friday: "8:00 AM - 12:00 AM",
      saturday: "8:00 AM - 12:00 AM",
      sunday: "8:00 AM - 11:00 PM",
    },
    amenities: [
      "High-Speed Wi-Fi",
      "Dedicated Power Sockets",
      "Specialty Cold Brews",
      "Air Conditioning",
    ],
    atmosphere: ["Work Friendly", "Modern Minimalist", "Cozy"],
    featured: true,
  },

  // 6. Colocal Dhan Mill
  {
    name: "Colocal — The Cacao Craft",
    description:
      "A stunning yellow-washed Pondicherry-style courtyard café with in-house bean-to-bar artisan chocolate, rich hot cocoa, sourdough sandwiches, and specialty coffee.",
    location: "The Dhan Mill, Chhatarpur",
    address: "100 Feet Road, The Dhan Mill Compound, Chhatarpur",
    city: "New Delhi",
    latitude: 28.5034,
    longitude: 77.1788,
    rating: 4.7,
    reviewCount: 428,
    priceRange: "₹1,200 for two",
    category: "Artisan Chocolate",
    image:
      "https://images.unsplash.com/photo-1511081692775-05d0f180a065?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1511081692775-05d0f180a065?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579888944880-d98341245702?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 93105 24620",
    openingHours: {
      monday: "11:00 AM - 11:00 PM",
      tuesday: "11:00 AM - 11:00 PM",
      wednesday: "11:00 AM - 11:00 PM",
      thursday: "11:00 AM - 11:00 PM",
      friday: "11:00 AM - 11:30 PM",
      saturday: "10:30 AM - 11:30 PM",
      sunday: "10:30 AM - 11:00 PM",
    },
    amenities: [
      "Bean to Bar Chocolate",
      "Outdoor Courtyard",
      "Pet Friendly",
      "Valet Parking",
    ],
    atmosphere: ["Aesthetic", "Colonial Courtyard", "Romantic"],
    featured: true,
  },

  // 7. Paul Bakery Vasant Kunj
  {
    name: "Paul French Bakery & Café",
    description:
      "Authentic French maison established in 1889, serving handcrafted butter croissants, escargot pastries, quiche Lorraine, macarons, and traditional café au lait.",
    location: "Vasant Kunj",
    address: "Ground Floor, Ambience Mall, Nelson Mandela Marg, Vasant Kunj",
    city: "New Delhi",
    latitude: 28.5401,
    longitude: 77.1558,
    rating: 4.6,
    reviewCount: 520,
    priceRange: "₹1,600 for two",
    category: "Artisan Bakery",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579888944880-d98341245702?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 11 4087 0760",
    openingHours: {
      monday: "9:00 AM - 11:00 PM",
      tuesday: "9:00 AM - 11:00 PM",
      wednesday: "9:00 AM - 11:00 PM",
      thursday: "9:00 AM - 11:00 PM",
      friday: "9:00 AM - 11:30 PM",
      saturday: "8:30 AM - 11:30 PM",
      sunday: "8:30 AM - 11:00 PM",
    },
    amenities: [
      "Artisan French Breads",
      "Gourmet Breakfast",
      "Air Conditioning",
      "Mall Parking",
    ],
    atmosphere: ["European Chic", "Family Friendly", "Classic Elegance"],
    featured: false,
  },

  // 8. Fabcafe Sunder Nursery
  {
    name: "Fabcafe by the Lake",
    description:
      "A serene lakeside open-air heritage café nestled inside Sunder Nursery, serving organic wholesome regional Indian bites, cold-pressed juices, and artisanal filter coffee.",
    location: "Sunder Nursery, Nizamuddin",
    address: "Near Sunder Nursery Heritage Park, Nizamuddin East",
    city: "New Delhi",
    latitude: 28.5947,
    longitude: 77.2458,
    rating: 4.6,
    reviewCount: 390,
    priceRange: "₹1,100 for two",
    category: "Healthy & Organic",
    image:
      "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 93114 11660",
    openingHours: {
      monday: "7:00 AM - 9:00 PM",
      tuesday: "7:00 AM - 9:00 PM",
      wednesday: "7:00 AM - 9:00 PM",
      thursday: "7:00 AM - 9:00 PM",
      friday: "7:00 AM - 9:30 PM",
      saturday: "7:00 AM - 10:00 PM",
      sunday: "7:00 AM - 10:00 PM",
    },
    amenities: [
      "Lakeside Seating",
      "Vegan & Gluten-Free Options",
      "Pet Friendly",
      "Heritage Park Walk",
    ],
    atmosphere: ["Scenic & Peaceful", "Outdoor Garden", "Healthy Living"],
    featured: true,
  },

  // 9. Perch Vasant Vihar
  {
    name: "Perch Wine & Coffee Bar",
    description:
      "A stylish Scandinavian-inspired café with white oak interiors, specialty Vietnamese and pour-over coffees, handcrafted Elderflower coolers, and European tapas.",
    location: "Basant Lok, Vasant Vihar",
    address: "Priya Complex, 24, Community Centre, Basant Lok, Vasant Vihar",
    city: "New Delhi",
    latitude: 28.5574,
    longitude: 77.1643,
    rating: 4.7,
    reviewCount: 462,
    priceRange: "₹1,600 for two",
    category: "Specialty Coffee",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 83739 76637",
    openingHours: {
      monday: "8:00 AM - 11:30 PM",
      tuesday: "8:00 AM - 11:30 PM",
      wednesday: "8:00 AM - 11:30 PM",
      thursday: "8:00 AM - 11:30 PM",
      friday: "8:00 AM - 12:30 AM",
      saturday: "8:00 AM - 12:30 AM",
      sunday: "8:00 AM - 11:30 PM",
    },
    amenities: [
      "Small-Batch Roasts",
      "Wine & Cocktails",
      "High-Speed Wi-Fi",
      "Valet Parking",
    ],
    atmosphere: ["Nordic Minimalist", "Cozy & Quiet", "Romantic"],
    featured: true,
  },

  // 10. Hamoni Golf Cafe Gurugram
  {
    name: "Hamoni: Café by the Greens",
    description:
      "A lush open-air golf driving range café surrounded by manicured green lawns, serving stone-baked sourdough pizzas, iced lattes, and peaceful sunset breakfasts.",
    location: "Sector 23A, Gurugram",
    address: "Hamoni Golf Camp, CK Farm, Carterpuri Village, Sector 23A",
    city: "Gurugram",
    latitude: 28.5133,
    longitude: 77.0422,
    rating: 4.6,
    reviewCount: 380,
    priceRange: "₹1,200 for two",
    category: "Outdoor Garden",
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 96500 00865",
    openingHours: {
      monday: "6:30 AM - 10:00 PM",
      tuesday: "6:30 AM - 10:00 PM",
      wednesday: "6:30 AM - 10:00 PM",
      thursday: "6:30 AM - 10:00 PM",
      friday: "6:30 AM - 10:30 PM",
      saturday: "6:00 AM - 10:30 PM",
      sunday: "6:00 AM - 10:30 PM",
    },
    amenities: [
      "Golf Range Views",
      "Outdoor Garden",
      "Ample Free Parking",
      "Pet Friendly",
    ],
    atmosphere: ["Greenery & Open Air", "Peaceful Escape", "Lively Brunch"],
    featured: false,
  },

  // 11. Roastery Coffee House Noida
  {
    name: "Roastery Coffee House",
    description:
      "Award-winning specialty roastery with cascading indoor plants, single-estate cold brews, cascara teas, and fresh artisan cheesecakes.",
    location: "Sector 144, Noida",
    address: "Oxygen Business Park, Near Advant Navis, Sector 144",
    city: "Noida",
    latitude: 28.4892,
    longitude: 77.4091,
    rating: 4.8,
    reviewCount: 512,
    priceRange: "₹800 for two",
    category: "Specialty Coffee",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 96502 94000",
    openingHours: {
      monday: "8:00 AM - 11:00 PM",
      tuesday: "8:00 AM - 11:00 PM",
      wednesday: "8:00 AM - 11:00 PM",
      thursday: "8:00 AM - 11:00 PM",
      friday: "8:00 AM - 11:30 PM",
      saturday: "8:00 AM - 11:30 PM",
      sunday: "8:00 AM - 11:00 PM",
    },
    amenities: [
      "In-House Micro Roastery",
      "Work Desks",
      "High-Speed Wi-Fi",
      "Valet Parking",
    ],
    atmosphere: ["Modern Greenery", "Work Friendly", "Aesthetic"],
    featured: true,
  },

  // 12. Caara at Ogaan Malcha Marg
  {
    name: "Caara at Ogaan",
    description:
      "Chic contemporary European café featuring farm-fresh local produce, house-made pestos, creamy burrata bowls, and artisanal sourdough flatbreads.",
    location: "Malcha Marg, Chanakyapuri",
    address: "3&4, Malcha Marg Shopping Centre, Diplomatic Enclave",
    city: "New Delhi",
    latitude: 28.6012,
    longitude: 77.1882,
    rating: 4.6,
    reviewCount: 275,
    priceRange: "₹1,600 for two",
    category: "Farm to Table",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 85888 87718",
    openingHours: {
      monday: "9:00 AM - 10:30 PM",
      tuesday: "9:00 AM - 10:30 PM",
      wednesday: "9:00 AM - 10:30 PM",
      thursday: "9:00 AM - 10:30 PM",
      friday: "9:00 AM - 11:00 PM",
      saturday: "9:00 AM - 11:00 PM",
      sunday: "9:00 AM - 10:30 PM",
    },
    amenities: [
      "Farm to Table Ingredients",
      "Specialty Espresso",
      "Valet Parking",
      "Wi-Fi",
    ],
    atmosphere: ["Chic European", "Sophisticated", "Quiet"],
    featured: false,
  },

  // 13. Greenr Café GK-1
  {
    name: "Greenr Plant-Based Café",
    description:
      "Pioneering conscious plant-based café serving California-style nourish bowls, superfood smoothies, vegan artisanal pizzas, and oat milk lattes.",
    location: "Greater Kailash I",
    address: "S-10, M Block Market, Greater Kailash I",
    city: "New Delhi",
    latitude: 28.5529,
    longitude: 77.2372,
    rating: 4.5,
    reviewCount: 340,
    priceRange: "₹1,100 for two",
    category: "Healthy & Vegan",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 98118 73240",
    openingHours: {
      monday: "12:00 PM - 10:30 PM",
      tuesday: "12:00 PM - 10:30 PM",
      wednesday: "12:00 PM - 10:30 PM",
      thursday: "12:00 PM - 10:30 PM",
      friday: "12:00 PM - 11:00 PM",
      saturday: "11:30 AM - 11:00 PM",
      sunday: "11:30 AM - 10:30 PM",
    },
    amenities: [
      "100% Vegan Options",
      "Gluten-Free Menu",
      "Fast Wi-Fi",
      "Air Conditioning",
    ],
    atmosphere: ["Modern Earthy", "Cozy", "Healthy"],
    featured: false,
  },

  // 14. Cafe Tesu Essex Farms
  {
    name: "Café Tesu",
    description:
      "An artistic pastel-themed café renowned for artisanal high teas, freshly pulled pour-overs, handmade Japanese cheesecakes, and all-day European breakfast.",
    location: "Essex Farms, Aurobindo Marg",
    address: "Essex Farms, 4 Aurobindo Marg, Near IIT Flyover",
    city: "New Delhi",
    latitude: 28.5441,
    longitude: 77.2023,
    rating: 4.5,
    reviewCount: 395,
    priceRange: "₹1,300 for two",
    category: "Artisan Bakery",
    image:
      "https://images.unsplash.com/photo-1579888944880-d98341245702?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1579888944880-d98341245702?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 98737 04704",
    openingHours: {
      monday: "8:00 AM - 11:00 PM",
      tuesday: "8:00 AM - 11:00 PM",
      wednesday: "8:00 AM - 11:00 PM",
      thursday: "8:00 AM - 11:00 PM",
      friday: "8:00 AM - 11:30 PM",
      saturday: "8:00 AM - 11:30 PM",
      sunday: "8:00 AM - 11:00 PM",
    },
    amenities: [
      "High Tea Selections",
      "Specialty Coffees",
      "Ample Parking",
      "Wi-Fi",
    ],
    atmosphere: ["Pastel Aesthetic", "Romantic", "Quiet & Relaxed"],
    featured: false,
  },

  // 15. Sly Granny Khan Market
  {
    name: "Sly Granny European Parlour",
    description:
      "An eclectic vintage European parlour café in Khan Market known for signature cocktails, banoffee pies, gourmet burgers, and rich specialty brews.",
    location: "Khan Market",
    address: "Flat 4, Middle Lane, Khan Market, Rabindra Nagar",
    city: "New Delhi",
    latitude: 28.6003,
    longitude: 77.2272,
    rating: 4.6,
    reviewCount: 418,
    priceRange: "₹1,800 for two",
    category: "European & Brunch",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 88261 31382",
    openingHours: {
      monday: "12:00 PM - 11:30 PM",
      tuesday: "12:00 PM - 11:30 PM",
      wednesday: "12:00 PM - 11:30 PM",
      thursday: "12:00 PM - 11:30 PM",
      friday: "12:00 PM - 12:00 AM",
      saturday: "12:00 PM - 12:00 AM",
      sunday: "12:00 PM - 11:30 PM",
    },
    amenities: [
      "Artisan Cocktails",
      "Gourmet European Menu",
      "Air Conditioning",
      "Market Location",
    ],
    atmosphere: ["Vintage Quirky", "Chic Parlour", "Lively"],
    featured: true,
  },

  // 16. Cha Bar Connaught Place
  {
    name: "Cha Bar & Oxford Bookstore",
    description:
      "Iconic tea bar inside Oxford Bookstore offering over 150 varieties of regional teas, masala chai, smoked chicken sandwiches, and a book lover's sanctuary.",
    location: "Connaught Place",
    address: "N-81, Barakhamba Road, Block N, Connaught Place",
    city: "New Delhi",
    latitude: 28.6304,
    longitude: 77.2215,
    rating: 4.4,
    reviewCount: 780,
    priceRange: "₹450 for two",
    category: "Tea & Books",
    image:
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511081692775-05d0f180a065?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 99107 54321",
    openingHours: {
      monday: "10:30 AM - 9:30 PM",
      tuesday: "10:30 AM - 9:30 PM",
      wednesday: "10:30 AM - 9:30 PM",
      thursday: "10:30 AM - 9:30 PM",
      friday: "10:30 AM - 9:30 PM",
      saturday: "10:30 AM - 10:00 PM",
      sunday: "10:30 AM - 10:00 PM",
    },
    amenities: [
      "In-House Bookstore",
      "150+ Tea Varieties",
      "Power Outlets",
      "Wi-Fi",
    ],
    atmosphere: ["Book Lovers", "Quiet Reading", "Classic Heritage"],
    featured: false,
  },

  // 17. Olive Bar & Kitchen Mehrauli
  {
    name: "Olive Bar & Kitchen",
    description:
      "A sun-dappled Mediterranean sanctuary under the banyan tree by Qutub Minar, featuring white pebbled courtyards, artisanal wood-fired pizzas, and gourmet sangrias.",
    location: "Mehrauli",
    address: "One Style Mile, Haveli 6, Kalka Das Marg, Mehrauli",
    city: "New Delhi",
    latitude: 28.5246,
    longitude: 77.1852,
    rating: 4.8,
    reviewCount: 920,
    priceRange: "₹3,000 for two",
    category: "Mediterranean Bistro",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 98102 35472",
    openingHours: {
      monday: "12:30 PM - 11:30 PM",
      tuesday: "12:30 PM - 11:30 PM",
      wednesday: "12:30 PM - 11:30 PM",
      thursday: "12:30 PM - 11:30 PM",
      friday: "12:30 PM - 12:30 AM",
      saturday: "12:30 PM - 12:30 AM",
      sunday: "12:30 PM - 11:30 PM",
    },
    amenities: [
      "Romantic Courtyard",
      "Mediterranean Cuisine",
      "Full Cocktail Bar",
      "Valet Parking",
    ],
    atmosphere: ["Romantic", "Luxury Outdoor", "Scenic Heritage"],
    featured: true,
  },

  // 18. Quick Brown Fox Roasters Dhan Mill
  {
    name: "Quick Brown Fox Coffee",
    description:
      "Experimental specialty micro-roastery offering nitro cold brews, anaerobic coffee flights, house-made brioche buns, and specialty avocado toasts.",
    location: "The Dhan Mill, Chhatarpur",
    address: "23A, The Dhan Mill Compound, 100 Feet Road, Chhatarpur",
    city: "New Delhi",
    latitude: 28.5036,
    longitude: 77.1782,
    rating: 4.6,
    reviewCount: 290,
    priceRange: "₹850 for two",
    category: "Specialty Coffee",
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 85274 08484",
    openingHours: {
      monday: "9:00 AM - 10:30 PM",
      tuesday: "9:00 AM - 10:30 PM",
      wednesday: "9:00 AM - 10:30 PM",
      thursday: "9:00 AM - 10:30 PM",
      friday: "9:00 AM - 11:00 PM",
      saturday: "8:30 AM - 11:00 PM",
      sunday: "8:30 AM - 10:30 PM",
    },
    amenities: [
      "Nitro Cold Brew Tap",
      "Experimental Bean Flights",
      "Pet Friendly",
      "High-Speed Wi-Fi",
    ],
    atmosphere: ["Industrial Chic", "Hipster Coffee", "Work Friendly"],
    featured: false,
  },

  // 19. United Coffee House CP
  {
    name: "United Coffee House",
    description:
      "Grand Victorian-era heritage café established in 1942, featuring crystal chandeliers, heritage Cona coffee, Swiss cheese souffles, and vintage parlor hospitality.",
    location: "Connaught Place",
    address: "E-15, Inner Circle, Connaught Place",
    city: "New Delhi",
    latitude: 28.6328,
    longitude: 77.2198,
    rating: 4.5,
    reviewCount: 840,
    priceRange: "₹1,900 for two",
    category: "Heritage & Coffee",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 11 2341 1694",
    openingHours: {
      monday: "10:00 AM - 11:30 PM",
      tuesday: "10:00 AM - 11:30 PM",
      wednesday: "10:00 AM - 11:30 PM",
      thursday: "10:00 AM - 11:30 PM",
      friday: "10:00 AM - 12:00 AM",
      saturday: "10:00 AM - 12:00 AM",
      sunday: "10:00 AM - 11:30 PM",
    },
    amenities: [
      "1942 Heritage Ambience",
      "Signature Cona Coffee",
      "Full Bar",
      "Valet Parking",
    ],
    atmosphere: ["Royal Vintage", "Heritage Elegance", "Classic"],
    featured: false,
  },

  // 20. Bahrison's Café Turtle Khan Market
  {
    name: "Café Turtle at Bahrisons",
    description:
      "One of Delhi's earliest bookshop cafés, beloved for vegetarian Mediterranean fare, freshly baked carrot cakes, aromatic coffees, and cozy reading corners.",
    location: "Khan Market",
    address: "Shop 23, 2nd Floor, Middle Lane, Khan Market",
    city: "New Delhi",
    latitude: 28.6001,
    longitude: 77.2275,
    rating: 4.4,
    reviewCount: 310,
    priceRange: "₹950 for two",
    category: "Books & Café",
    image:
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511081692775-05d0f180a065?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 11 2465 5641",
    openingHours: {
      monday: "10:00 AM - 8:30 PM",
      tuesday: "10:00 AM - 8:30 PM",
      wednesday: "10:00 AM - 8:30 PM",
      thursday: "10:00 AM - 8:30 PM",
      friday: "10:00 AM - 9:00 PM",
      saturday: "10:00 AM - 9:00 PM",
      sunday: "10:00 AM - 8:30 PM",
    },
    amenities: [
      "Bookstore Access",
      "Fresh Fruit Bakes",
      "Quiet Environment",
      "Air Conditioning",
    ],
    atmosphere: ["Literary Calm", "Cozy & Quiet", "Vintage"],
    featured: false,
  },

  // 21. Di Ghent Café CyberHub Gurgaon
  {
    name: "Di Ghent Café",
    description:
      "An authentic Belgian café serving classic Liege waffles, savory crepes, European paninis, and rich Belgian hot chocolate in a cozy wooden loft setting.",
    location: "DLF Phase 4, Gurugram",
    address: "208, Level 2, Cross Point Mall, DLF Phase 4",
    city: "Gurugram",
    latitude: 28.4682,
    longitude: 77.0863,
    rating: 4.6,
    reviewCount: 640,
    priceRange: "₹1,500 for two",
    category: "Belgian & Bakery",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 124 422 7444",
    openingHours: {
      monday: "8:00 AM - 11:00 PM",
      tuesday: "8:00 AM - 11:00 PM",
      wednesday: "8:00 AM - 11:00 PM",
      thursday: "8:00 AM - 11:00 PM",
      friday: "8:00 AM - 11:30 PM",
      saturday: "8:00 AM - 11:30 PM",
      sunday: "8:00 AM - 11:00 PM",
    },
    amenities: [
      "Belgian Waffle Bar",
      "Artisan Breakfast",
      "High-Speed Wi-Fi",
      "Mall Parking",
    ],
    atmosphere: ["Warm European Loft", "Cozy", "Family Friendly"],
    featured: true,
  },

  // 22. Roots Café in the Park Gurgaon
  {
    name: "Roots — Café in the Park",
    description:
      "A rustic, solar-powered garden café situated inside Rajiv Gandhi Renewable Energy Park, serving poha, French press coffees, masala chai, and fresh juices.",
    location: "Sector 29, Gurugram",
    address: "Rajiv Gandhi Renewable Energy Park, Sector 29",
    city: "Gurugram",
    latitude: 28.4688,
    longitude: 77.0652,
    rating: 4.5,
    reviewCount: 510,
    priceRange: "₹550 for two",
    category: "Outdoor Garden",
    image:
      "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 98711 58218",
    openingHours: {
      monday: "8:00 AM - 8:00 PM",
      tuesday: "8:00 AM - 8:00 PM",
      wednesday: "8:00 AM - 8:00 PM",
      thursday: "8:00 AM - 8:00 PM",
      friday: "8:00 AM - 8:30 PM",
      saturday: "7:30 AM - 9:00 PM",
      sunday: "7:30 AM - 9:00 PM",
    },
    amenities: [
      "Lush Park Setting",
      "Wholesome Breakfast",
      "Pet Friendly",
      "Open Air Seating",
    ],
    atmosphere: ["Serene Nature", "Family Friendly", "Morning Vibes"],
    featured: false,
  },

  // 23. Kunafa House GK-1
  {
    name: "Kunafa House Artisan Café",
    description:
      "A Turkish and Middle Eastern dessert café specializing in golden spun-pastry cheese kunafa, aromatic Arabic cardamom coffee, and pistachio baklava.",
    location: "Greater Kailash I",
    address: "M-48, M Block Market, Greater Kailash I",
    city: "New Delhi",
    latitude: 28.5531,
    longitude: 77.2378,
    rating: 4.6,
    reviewCount: 310,
    priceRange: "₹650 for two",
    category: "Desserts",
    image:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511081692775-05d0f180a065?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579888944880-d98341245702?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 98188 44020",
    openingHours: {
      monday: "12:00 PM - 11:30 PM",
      tuesday: "12:00 PM - 11:30 PM",
      wednesday: "12:00 PM - 11:30 PM",
      thursday: "12:00 PM - 11:30 PM",
      friday: "12:00 PM - 12:00 AM",
      saturday: "12:00 PM - 12:00 AM",
      sunday: "12:00 PM - 11:30 PM",
    },
    amenities: [
      "Live Kunafa Kitchen",
      "Arabic Coffee",
      "Air Conditioning",
      "Takeaway Boxes",
    ],
    atmosphere: ["Middle Eastern Sweet", "Cozy", "Lively Evening"],
    featured: false,
  },

  // 24. Cafe Delhi Heights Aerocity
  {
    name: "Café Delhi Heights",
    description:
      "Famous for its juicy signature Juicy Lucy burger, hearty butter chicken pasta, decadent chocolate mud cakes, and lively energetic ambiance.",
    location: "Aerocity",
    address: "Asset 6, Ground Floor, Worldmark 1, Aerocity",
    city: "New Delhi",
    latitude: 28.5501,
    longitude: 77.1215,
    rating: 4.5,
    reviewCount: 680,
    priceRange: "₹1,500 for two",
    category: "Comfort Food & Bar",
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 97111 11333",
    openingHours: {
      monday: "11:00 AM - 12:00 AM",
      tuesday: "11:00 AM - 12:00 AM",
      wednesday: "11:00 AM - 12:00 AM",
      thursday: "11:00 AM - 12:00 AM",
      friday: "11:00 AM - 1:00 AM",
      saturday: "11:00 AM - 1:00 AM",
      sunday: "11:00 AM - 12:00 AM",
    },
    amenities: [
      "Full Bar",
      "Live Sports Screenings",
      "Air Conditioning",
      "Valet Parking",
    ],
    atmosphere: ["Lively & Vibrant", "Family Friendly", "Upbeat"],
    featured: false,
  },

  // 25. Smoke House Deli Khan Market
  {
    name: "Smoke House Deli",
    description:
      "Whimsical hand-illustrated European deli known for gourmet eggs Benedict, handmade smoked chicken ravioli, fresh cold-pressed tonics, and artisan coffees.",
    location: "Khan Market",
    address: "17, Khan Market, Rabindra Nagar",
    city: "New Delhi",
    latitude: 28.6004,
    longitude: 77.2271,
    rating: 4.6,
    reviewCount: 520,
    priceRange: "₹1,700 for two",
    category: "European Deli",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 11 4356 2820",
    openingHours: {
      monday: "9:00 AM - 11:30 PM",
      tuesday: "9:00 AM - 11:30 PM",
      wednesday: "9:00 AM - 11:30 PM",
      thursday: "9:00 AM - 11:30 PM",
      friday: "9:00 AM - 12:00 AM",
      saturday: "8:30 AM - 12:00 AM",
      sunday: "8:30 AM - 11:30 PM",
    },
    amenities: [
      "All-Day Gourmet Breakfast",
      "Artisan Espresso",
      "Air Conditioning",
      "Wi-Fi",
    ],
    atmosphere: ["Hand-Drawn Chic", "Quirky European", "Cozy"],
    featured: true,
  },

  // 26. Another Fine Day Golf Course Road
  {
    name: "Another Fine Day — Books & Café",
    description:
      "A cozy brick-walled retreat on Golf Course Road filled with board games, reading nooks, freshly made hot waffles, and artisanal specialty coffees.",
    location: "Golf Course Road, Gurugram",
    address: "Ground Floor, MPD Towers, DLF Phase 5, Golf Course Road",
    city: "Gurugram",
    latitude: 28.4412,
    longitude: 77.0984,
    rating: 4.5,
    reviewCount: 310,
    priceRange: "₹850 for two",
    category: "Books & Café",
    image:
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511081692775-05d0f180a065?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 124 438 6140",
    openingHours: {
      monday: "10:00 AM - 10:30 PM",
      tuesday: "10:00 AM - 10:30 PM",
      wednesday: "10:00 AM - 10:30 PM",
      thursday: "10:00 AM - 10:30 PM",
      friday: "10:00 AM - 11:00 PM",
      saturday: "9:30 AM - 11:00 PM",
      sunday: "9:30 AM - 10:30 PM",
    },
    amenities: [
      "Board Games Library",
      "Reading Nooks",
      "High-Speed Wi-Fi",
      "Free Parking",
    ],
    atmosphere: ["Cozy & Casual", "Work Friendly", "Relaxed"],
    featured: false,
  },

  // 27. Theos Patisserie Sector 104 Noida
  {
    name: "Theos Chocolaterie & Patisserie",
    description:
      "Noida's premier gourmet patisserie renowned for velvety Dutch truffle cakes, red velvet cheesecakes, artisan sourdough baguettes, and rich hazelnut frappes.",
    location: "Sector 104, Noida",
    address: "Hazratpur, Dynamic House, Main Road, Sector 104",
    city: "Noida",
    latitude: 28.5364,
    longitude: 77.3681,
    rating: 4.7,
    reviewCount: 720,
    priceRange: "₹850 for two",
    category: "Desserts & Bakery",
    image:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579888944880-d98341245702?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 87502 42000",
    openingHours: {
      monday: "9:00 AM - 11:30 PM",
      tuesday: "9:00 AM - 11:30 PM",
      wednesday: "9:00 AM - 11:30 PM",
      thursday: "9:00 AM - 11:30 PM",
      friday: "9:00 AM - 12:00 AM",
      saturday: "9:00 AM - 12:00 AM",
      sunday: "9:00 AM - 11:30 PM",
    },
    amenities: [
      "Gourmet French Cakes",
      "Custom Dessert Counter",
      "Specialty Shakes",
      "Air Conditioning",
    ],
    atmosphere: ["Chocolaty Sweet", "Lively", "Modern"],
    featured: true,
  },

  // 28. Haven Coffee Craft Sector 75 Noida
  {
    name: "Haven International Coffee House",
    description:
      "Minimalist concrete coffee bar brewing microlot single origins from Chikmagalur, specialty cold drips, cinnamon rolls, and artisan matcha lattes.",
    location: "Sector 75, Noida",
    address: "Gardenia Gateway Market, Sector 75",
    city: "Noida",
    latitude: 28.5772,
    longitude: 77.3822,
    rating: 4.6,
    reviewCount: 230,
    priceRange: "₹600 for two",
    category: "Specialty Coffee",
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 99990 12845",
    openingHours: {
      monday: "8:00 AM - 10:30 PM",
      tuesday: "8:00 AM - 10:30 PM",
      wednesday: "8:00 AM - 10:30 PM",
      thursday: "8:00 AM - 10:30 PM",
      friday: "8:00 AM - 11:00 PM",
      saturday: "8:00 AM - 11:00 PM",
      sunday: "8:00 AM - 10:30 PM",
    },
    amenities: [
      "Microlot Single Origins",
      "Matcha & Specialty Teas",
      "High-Speed Wi-Fi",
      "Power Outlets",
    ],
    atmosphere: ["Minimalist Japanese", "Work Friendly", "Quiet"],
    featured: false,
  },

  // 29. Music & Mountains M-Block GK-1
  {
    name: "Music & Mountains Hillside Café",
    description:
      "A rustic timber cabin café transporting you straight to a snowy alpine lodge, serving hearty Shepherd's pie, mulled coffees, and warm apple crumbles.",
    location: "Greater Kailash I",
    address: "M-23, M Block Market, Greater Kailash I",
    city: "New Delhi",
    latitude: 28.5527,
    longitude: 77.2374,
    rating: 4.7,
    reviewCount: 580,
    priceRange: "₹1,900 for two",
    category: "Rustic European",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 98731 60659",
    openingHours: {
      monday: "12:30 PM - 11:30 PM",
      tuesday: "12:30 PM - 11:30 PM",
      wednesday: "12:30 PM - 11:30 PM",
      thursday: "12:30 PM - 11:30 PM",
      friday: "12:30 PM - 12:00 AM",
      saturday: "12:00 PM - 12:00 AM",
      sunday: "12:00 PM - 11:30 PM",
    },
    amenities: [
      "Alpine Cabin Décor",
      "Candlelight Dining",
      "Cocktails & Wines",
      "Air Conditioning",
    ],
    atmosphere: ["Romantic Mountain Lodge", "Cozy Fireplace Vibe", "Intimate"],
    featured: true,
  },

  // 30. Jugmug Thela Champa Gali
  {
    name: "Jugmug Thela — Artisan Chai & Coffee",
    description:
      "A rustic backyard tea-and-coffee garden illuminated by fairy lights, serving gourmet artisanal chais, 12-spice hot chocolates, and freshly baked cookies.",
    location: "Champa Gali, Saket",
    address: "Shed 4, Khasra 258, Lane 3, Westend Marg, Saidulajab",
    city: "New Delhi",
    latitude: 28.5202,
    longitude: 77.2003,
    rating: 4.6,
    reviewCount: 490,
    priceRange: "₹550 for two",
    category: "Artisan Chai & Coffee",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=90&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=90&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=90&w=1200&auto=format&fit=crop",
    ],
    phone: "+91 98710 87072",
    openingHours: {
      monday: "11:00 AM - 10:00 PM",
      tuesday: "11:00 AM - 10:00 PM",
      wednesday: "11:00 AM - 10:00 PM",
      thursday: "11:00 AM - 10:00 PM",
      friday: "11:00 AM - 10:30 PM",
      saturday: "11:00 AM - 11:00 PM",
      sunday: "11:00 AM - 10:30 PM",
    },
    amenities: [
      "Backyard Fairy Lights",
      "Spiced Hot Chocolates",
      "Pet Friendly",
      "Outdoor Seating",
    ],
    atmosphere: ["Bohemian Fairy Tale", "Romantic", "Cozy Outdoor"],
    featured: true,
  },
];

async function seedCafes() {
  console.log("🚀 Starting updating 30 cafés with clean price format into Firestore...");

  const cafesRef = db.collection("cafes");
  const existingDocs = await cafesRef.get();

  if (!existingDocs.empty) {
    console.log(`🧹 Clearing ${existingDocs.size} existing café records...`);
    const deleteBatch = db.batch();
    existingDocs.forEach((docSnap) => deleteBatch.delete(docSnap.ref));
    await deleteBatch.commit();
  }

  const batch = db.batch();

  for (const cafe of cafes) {
    const cafeRef = cafesRef.doc();
    batch.set(cafeRef, {
      ...cafe,
      createdAt: new Date(),
    });
  }

  await batch.commit();
  console.log(`✅ Successfully seeded ${cafes.length} cafés with clean prices into Firestore!`);
}

seedCafes()
  .then(() => {
    console.log("✨ Seed completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed failed with error:", error);
    process.exit(1);
  });
