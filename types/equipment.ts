export interface Specification {
  label: string;
  value: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  additionalImages: string[];
  dailyRate: number;
  weeklyRate: number;
  location: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  ownerRating: number;
  rating: number;
  reviews: number;
  featured: boolean;
  availability: string;
  specifications: Specification[];
}