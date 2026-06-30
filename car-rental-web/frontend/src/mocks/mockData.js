

export const mockUsers = [
  {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed_password_123',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    phone: '+1-234-567-8900',
    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=John'
  },
  {
    _id: '507f1f77bcf86cd799439012',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'hashed_password_456',
    role: 'user',
    status: 'active',
    createdAt: '2024-02-20T14:15:00Z',
    phone: '+1-234-567-8901',
    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Jane'
  },
  {
    _id: '507f1f77bcf86cd799439013',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'hashed_admin_123',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01T08:00:00Z',
    phone: '+1-234-567-8902',
    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Admin'
  },
  {
    _id: '507f1f77bcf86cd799439014',
    name: 'Michael Chen',
    email: 'michael@example.com',
    password: 'hashed_password_789',
    role: 'user',
    status: 'inactive',
    createdAt: '2024-03-10T11:45:00Z',
    phone: '+1-234-567-8903',
    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Michael'
  },
  {
    _id: '507f1f77bcf86cd799439015',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    password: 'hashed_password_101',
    role: 'user',
    status: 'active',
    createdAt: '2024-02-28T09:20:00Z',
    phone: '+1-234-567-8904',
    avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=Sarah'
  }
];

// ============================================================================
// 2. MOCK CARS DATA
// ============================================================================

export const mockCars = [
  {
    _id: '507f191e810c19729de860ea',
    name: 'Tesla Model S Plaid',
    brand: 'Tesla',
    model: 'Model S Plaid',
    type: 'Sedan',
    year: 2024,
    pricePerDay: 5000000,
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a63c111b67?w=800&h=600&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1560958089-b8a63c111b67?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800&h=600&fit=crop'
    ],
    seats: 5,
    transmission: 'Auto',
    fuelType: 'Electric',
    mileage: 0,
    description: 'Experience the pinnacle of electric performance with the Tesla Model S Plaid. With tri-motor performance and sub-3 second acceleration, this is the future of luxury driving.',
    location: 'Ho Chi Minh City',
    pickupLocationCoords: { lat: 10.8141, lng: 106.6663 },
    rating: 4.9,
    availability: true,
    features: ['Auto Pilot', 'Panoramic Roof', 'Premium Sound System', 'Air Suspension', 'WiFi'],
    reviews: [
      { user: 'John Doe', rating: 5, comment: 'Incredible acceleration and handling!' },
      { user: 'Jane Smith', rating: 5, comment: 'Best driving experience ever!' }
    ]
  },
  {
    _id: '507f191e810c19729de860eb',
    name: 'Lamborghini Revuelto',
    brand: 'Lamborghini',
    model: 'Revuelto',
    type: 'Supercar',
    year: 2024,
    pricePerDay: 12000000,
    imageUrl: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b0b?w=800&h=600&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1578474846511-04ba529f0b0b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
    ],
    seats: 2,
    transmission: 'Auto',
    fuelType: 'Gasoline',
    mileage: 0,
    description: 'The Lamborghini Revuelto is a hybrid hypercar representing the apex of luxury and performance. Pure Italian craftsmanship meets cutting-edge technology.',
    location: 'Ha Noi',
    pickupLocationCoords: { lat: 21.0285, lng: 105.8542 },
    rating: 5.0,
    availability: true,
    features: ['Hybrid Engine', 'Carbon Fiber Body', 'Advanced Aerodynamics', 'Satellite Navigation', 'Premium Leather'],
    reviews: [
      { user: 'Michael Chen', rating: 5, comment: 'Dream car realized!' }
    ]
  },
  {
    _id: '507f191e810c19729de860ec',
    name: 'BMW M5 Competition',
    brand: 'BMW',
    model: 'M5 Competition',
    type: 'Sedan',
    year: 2024,
    pricePerDay: 4500000,
    imageUrl: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800&h=600&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1606611013016-969c19d14311?w=800&h=600&fit=crop'
    ],
    seats: 5,
    transmission: 'Auto',
    fuelType: 'Gasoline',
    mileage: 0,
    description: 'The BMW M5 Competition combines luxury and performance with twin-turbo power, sophisticated handling, and premium German engineering.',
    location: 'Da Nang',
    pickupLocationCoords: { lat: 16.0544, lng: 108.2022 },
    rating: 4.8,
    availability: true,
    features: ['M Sport Suspension', 'M Steering', '20-inch M Light Alloys', 'Carbon Trims', 'Harman Kardon Sound'],
    reviews: [
      { user: 'Sarah Johnson', rating: 5, comment: 'Perfectly balanced performance sedan' }
    ]
  },
  {
    _id: '507f191e810c19729de860ed',
    name: 'Mercedes-AMG G 63',
    brand: 'Mercedes-Benz',
    model: 'AMG G 63',
    type: 'SUV',
    year: 2024,
    pricePerDay: 6000000,
    imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c3dec7d44?w=800&h=600&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1605559424843-9e4c3dec7d44?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1606611013016-969c19d14311?w=800&h=600&fit=crop'
    ],
    seats: 5,
    transmission: 'Auto',
    fuelType: 'Gasoline',
    mileage: 0,
    description: 'The iconic Mercedes-AMG G 63 delivers luxury SUV performance with aggressive styling, powerful twin-turbo engine, and commanding presence.',
    location: 'Ho Chi Minh City',
    pickupLocationCoords: { lat: 10.8141, lng: 106.6663 },
    rating: 4.7,
    availability: true,
    features: ['AMG Ride Control', 'Panoramic Sunroof', 'Advanced 4x4 System', 'Carbon Trim', 'Burmester Sound'],
    reviews: []
  },
  {
    _id: '507f191e810c19729de860ee',
    name: 'Porsche 911 Turbo',
    brand: 'Porsche',
    model: '911 Turbo',
    type: 'Sports',
    year: 2024,
    pricePerDay: 7500000,
    imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&h=600&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1570374472147-c3e50c8e8e22?w=800&h=600&fit=crop'
    ],
    seats: 4,
    transmission: 'Auto',
    fuelType: 'Gasoline',
    mileage: 0,
    description: 'The Porsche 911 Turbo represents the ultimate sports car: breathtaking performance, timeless design, and legendary driving dynamics.',
    location: 'Ha Noi',
    pickupLocationCoords: { lat: 21.0285, lng: 105.8542 },
    rating: 4.9,
    availability: true,
    features: ['Twin-Turbo Engine', 'All-Wheel Drive', 'Adaptive Suspension', 'Carbon Ceramic Brakes', 'Sport Chrono'],
    reviews: []
  },
  {
    _id: '507f191e810c19729de860ef',
    name: 'Audi R8 V10',
    brand: 'Audi',
    model: 'R8 V10',
    type: 'Supercar',
    year: 2024,
    pricePerDay: 9000000,
    imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=600&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&h=600&fit=crop'
    ],
    seats: 2,
    transmission: 'Auto',
    fuelType: 'Gasoline',
    mileage: 0,
    description: 'The Audi R8 V10 is a masterpiece of German engineering combining a naturally aspirated V10 engine with sleek design and precision handling.',
    location: 'Da Nang',
    pickupLocationCoords: { lat: 16.0544, lng: 108.2022 },
    rating: 4.8,
    availability: true,
    features: ['V10 Natural Aspiration', 'Quattro All-Wheel Drive', 'Carbon Fiber Seats', 'LED Headlights', 'Bang & Olufsen Sound'],
    reviews: []
  },
  {
    _id: '507f191e810c19729de860f0',
    name: 'Range Rover Sport',
    brand: 'Land Rover',
    model: 'Range Rover Sport',
    type: 'SUV',
    year: 2023,
    pricePerDay: 3500000,
    imageUrl: 'https://images.unsplash.com/photo-1606611013016-969c19d14311?w=800&h=600&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1606611013016-969c19d14311?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1605559424843-9e4c3dec7d44?w=800&h=600&fit=crop'
    ],
    seats: 5,
    transmission: 'Auto',
    fuelType: 'Gasoline',
    mileage: 0,
    description: 'The Range Rover Sport combines elegance with versatility. Perfect for urban exploration and weekend adventures with premium comfort.',
    location: 'Ho Chi Minh City',
    pickupLocationCoords: { lat: 10.8141, lng: 106.6663 },
    rating: 4.6,
    availability: true,
    features: ['All-Terrain Capability', 'Panoramic Roof', 'Adaptive Dynamics', 'Meridian Sound', 'Touchscreen Navigation'],
    reviews: []
  },
  {
    _id: '507f191e810c19729de860f1',
    name: 'Jaguar F-TYPE SVR',
    brand: 'Jaguar',
    model: 'F-TYPE SVR',
    type: 'Sports',
    year: 2024,
    pricePerDay: 5500000,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&h=600&fit=crop'
    ],
    seats: 2,
    transmission: 'Auto',
    fuelType: 'Gasoline',
    mileage: 0,
    description: 'The Jaguar F-TYPE SVR is a British sports car icon featuring a supercharged V8 engine, dramatic design, and exhilarating performance.',
    location: 'Ha Noi',
    pickupLocationCoords: { lat: 21.0285, lng: 105.8542 },
    rating: 4.7,
    availability: true,
    features: ['Supercharged V8', 'All-Wheel Drive', 'Active Exhaust', 'Carbon Fiber Details', 'Meridian Premium Sound'],
    reviews: []
  }
];

// ============================================================================
// 3. MOCK BOOKINGS DATA
// ============================================================================

export const mockBookings = [
  {
    _id: '507f191e810c19729de860aa',
    car: mockCars[0],
    customer: mockUsers[0],
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+1-234-567-8900',
    pickupDate: '2024-06-15T09:00:00Z',
    returnDate: '2024-06-20T18:00:00Z',
    pickupLocation: 'Ho Chi Minh City Airport',
    pickupLocationCoords: { lat: 10.8141, lng: 106.6663 },
    dropoffLocationCoords: { lat: 10.7769, lng: 106.7009 },
    distanceKm: 8.5,
    totalPrice: 25000000,
    addOns: ['basic_insurance', 'gps'],
    note: 'Extra luggage',
    status: 'Approved',
    paymentStatus: 'paid',
    paymentMethod: 'vietqr',
    transactionId: 'TXN202406001',
    lateFee: 0,
    createdAt: '2024-06-10T10:00:00Z'
  },
  {
    _id: '507f191e810c19729de860ab',
    car: mockCars[1],
    customer: mockUsers[1],
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerPhone: '+1-234-567-8901',
    pickupDate: '2024-07-01T10:00:00Z',
    returnDate: '2024-07-05T16:00:00Z',
    pickupLocation: 'Ha Noi International',
    pickupLocationCoords: { lat: 21.0285, lng: 105.8542 },
    dropoffLocationCoords: { lat: 21.1146, lng: 105.7755 },
    distanceKm: 12.3,
    totalPrice: 48000000,
    addOns: ['premium_insurance', 'gps', 'child_seat'],
    note: '',
    status: 'Pending',
    paymentStatus: 'pending',
    paymentMethod: 'vietqr',
    transactionId: 'TXN202407001',
    lateFee: 0,
    createdAt: '2024-06-20T14:30:00Z'
  },
  {
    _id: '507f191e810c19729de860ac',
    car: mockCars[2],
    customer: mockUsers[2],
    customerName: 'Michael Chen',
    customerEmail: 'michael@example.com',
    customerPhone: '+1-234-567-8903',
    pickupDate: '2024-06-25T08:00:00Z',
    returnDate: '2024-06-28T17:00:00Z',
    pickupLocation: 'Da Nang Airport',
    pickupLocationCoords: { lat: 16.0544, lng: 108.2022 },
    dropoffLocationCoords: { lat: 16.0867, lng: 108.2694 },
    distanceKm: 9.1,
    totalPrice: 13500000,
    addOns: ['basic_insurance'],
    note: 'Traveling with family',
    status: 'Completed',
    paymentStatus: 'paid',
    paymentMethod: 'vietqr',
    transactionId: 'TXN202406002',
    lateFee: 0,
    createdAt: '2024-06-18T09:15:00Z'
  },
  {
    _id: '507f191e810c19729de860ad',
    car: mockCars[3],
    customer: mockUsers[3],
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah@example.com',
    customerPhone: '+1-234-567-8904',
    pickupDate: '2024-07-10T11:00:00Z',
    returnDate: '2024-07-13T15:00:00Z',
    pickupLocation: 'Ho Chi Minh City',
    pickupLocationCoords: { lat: 10.8141, lng: 106.6663 },
    dropoffLocationCoords: { lat: 10.8141, lng: 106.6663 },
    distanceKm: 0,
    totalPrice: 18000000,
    addOns: ['premium_insurance', 'gps'],
    note: '',
    status: 'Approved',
    paymentStatus: 'paid',
    paymentMethod: 'vietqr',
    transactionId: 'TXN202407002',
    lateFee: 0,
    createdAt: '2024-07-05T13:45:00Z'
  }
];

// ============================================================================
// 4. MOCK BOOKED DATES (for availability calendar)
// ============================================================================

export const mockBookedDates = {
  '507f191e810c19729de860ea': [ // Tesla Model S
    { pickupDate: '2024-06-15T09:00:00Z', returnDate: '2024-06-20T18:00:00Z' },
    { pickupDate: '2024-07-05T10:00:00Z', returnDate: '2024-07-08T17:00:00Z' },
    { pickupDate: '2024-07-20T08:00:00Z', returnDate: '2024-07-25T16:00:00Z' }
  ],
  '507f191e810c19729de860eb': [ // Lamborghini
    { pickupDate: '2024-07-01T10:00:00Z', returnDate: '2024-07-05T16:00:00Z' },
    { pickupDate: '2024-07-15T09:00:00Z', returnDate: '2024-07-18T17:00:00Z' }
  ],
  '507f191e810c19729de860ec': [ // BMW M5
    { pickupDate: '2024-06-25T08:00:00Z', returnDate: '2024-06-28T17:00:00Z' },
    { pickupDate: '2024-07-10T11:00:00Z', returnDate: '2024-07-12T15:00:00Z' }
  ]
};

// ============================================================================
// 5. MOCK PRICING DATA (dynamic pricing)
// ============================================================================

export const mockPricingSurges = [
  {
    carId: '507f191e810c19729de860ea',
    brand: 'Tesla',
    model: 'Model S Plaid',
    image: mockCars[0].imageUrl,
    basePrice: 5000000,
    dynamicPrice: 5500000,
    surgePercentage: 10
  },
  {
    carId: '507f191e810c19729de860eb',
    brand: 'Lamborghini',
    model: 'Revuelto',
    image: mockCars[1].imageUrl,
    basePrice: 12000000,
    dynamicPrice: 14400000,
    surgePercentage: 20
  },
  {
    carId: '507f191e810c19729de860ec',
    brand: 'BMW',
    model: 'M5 Competition',
    image: mockCars[2].imageUrl,
    basePrice: 4500000,
    dynamicPrice: 4860000,
    surgePercentage: 8
  },
  {
    carId: '507f191e810c19729de860ed',
    brand: 'Mercedes-Benz',
    model: 'AMG G 63',
    image: mockCars[3].imageUrl,
    basePrice: 6000000,
    dynamicPrice: 7200000,
    surgePercentage: 20
  }
];

// ============================================================================
// 6. MOCK DASHBOARD STATS
// ============================================================================

export const mockStats = {
  totalUsers: 156,
  activeUsers: 98,
  newUsersThisMonth: 23,
  totalCars: 42,
  totalBookings: 487,
  revenue: 2450000000,
  monthlyRevenue: {
    '2024-1': 180000000,
    '2024-2': 210000000,
    '2024-3': 245000000,
    '2024-4': 280000000,
    '2024-5': 325000000,
    '2024-6': 430000000
  },
  bookingsByLocation: {
    'Ho Chi Minh City': 145,
    'Ha Noi': 98,
    'Da Nang': 67,
    'Can Tho': 45,
    'Hai Phong': 56,
    'Nha Trang': 76
  },
  bookingStatusStats: {
    'Pending': 34,
    'Approved': 289,
    'Completed': 156,
    'Cancelled': 8
  },
  topCars: [
    { name: 'Tesla Model S Plaid', brand: 'Tesla', model: 'Model S Plaid', imageUrl: mockCars[0].imageUrl, count: 45 },
    { name: 'BMW M5 Competition', brand: 'BMW', model: 'M5 Competition', imageUrl: mockCars[2].imageUrl, count: 38 },
    { name: 'Mercedes-AMG G 63', brand: 'Mercedes-Benz', model: 'AMG G 63', imageUrl: mockCars[3].imageUrl, count: 34 },
    { name: 'Porsche 911 Turbo', brand: 'Porsche', model: '911 Turbo', imageUrl: mockCars[4].imageUrl, count: 29 },
    { name: 'Range Rover Sport', brand: 'Land Rover', model: 'Range Rover Sport', imageUrl: mockCars[6].imageUrl, count: 25 }
  ]
};

// ============================================================================
// 7. UTILITY FUNCTION: SIMULATE NETWORK DELAY
// ============================================================================

/**
 * Simulates network delay by wrapping data in a Promise with setTimeout
 * @param {*} data - The data to return
 * @param {number} delayMs - Delay in milliseconds (default: 500-1000ms random)
 * @returns {Promise}
 */
export const simulateNetworkDelay = (data, delayMs = null) => {
  const delay = delayMs || (500 + Math.random() * 500); // Random 500-1000ms
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

/**
 * Simulate API error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {Promise} - Rejects with error object
 */
export const simulateError = (message = 'API Error', status = 500) => {
  return simulateNetworkDelay(null).then(() => {
    const error = new Error(message);
    error.response = {
      status,
      data: { message, error: message }
    };
    throw error;
  });
};
