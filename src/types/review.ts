export type Review = {
  id: string;
  cafeId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt?: unknown;
};

export type CreateReviewInput = {
  cafeId: string;
  rating: number;
  comment: string;
  images?: string[];
  userName?: string;
  userAvatar?: string;
};

export type RatingBreakdown = {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
  total: number;
  average: number;
};
