export interface Review {
  id: string;
  equipmentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  text: string;
  createdAt: string;
}

export type CreateReviewInput = Omit<Review, 'id' | 'createdAt'>;