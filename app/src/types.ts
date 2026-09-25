export type GuestScreen = 'home' | 'search' | 'destinations' | 'destination' | 'bantul' | 'bandung' | 'solo' | 'malang' | 'surabaya' | 'denpasar' | 'semarang' | 'hotel' | 'rooms' | 'checkout' | 'confirmation';
export type SearchState = { destination: string; checkIn: string; checkOut: string; guests: number; adults: number; children: number };
