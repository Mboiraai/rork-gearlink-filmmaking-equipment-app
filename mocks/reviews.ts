import type { Review } from '@/types/review';

export const reviewsMock: Review[] = [
  {
    id: 'r1',
    equipmentId: '1',
    userId: 'u1',
    userName: 'Daniel Kim',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    rating: 5,
    text: 'Amazing camera, pristine condition. Owner was super helpful with setup tips.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'r2',
    equipmentId: '1',
    userId: 'u2',
    userName: 'Aisha Bello',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
    rating: 4,
    text: 'Great image quality. Batteries could be better, but overall solid.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: 'r3',
    equipmentId: '3',
    userId: 'u3',
    userName: 'Omar Faruk',
    userAvatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=200',
    rating: 5,
    text: 'The 600d is a beast. Included all accessories, worked flawlessly.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
];