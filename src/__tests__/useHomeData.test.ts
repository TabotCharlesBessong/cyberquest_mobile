import { useHomeData } from '../hooks/useHomeData';
import { useAuthStore } from '@/stores/authStore';
import { useLectures, useMyProgress } from '../hooks/useApiQueries';

jest.mock('../hooks/useApiQueries');
jest.mock('@/stores/authStore');

describe('useHomeData', () => {
  const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
  const mockUseLectures = useLectures as jest.MockedFunction<typeof useLectures>;
  const mockUseMyProgress = useMyProgress as jest.MockedFunction<typeof useMyProgress>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuthStore.mockReturnValue({
      user: { id: '1', name: 'Test', ageGroup: 'A', xp: 0, level: 1, streak: 0, hearts: 5, gems: 0, avatar: '🦊', onboarded: true, isVerified: true, email: '', age: 10, createdAt: '', updatedAt: '' },
      modules: [],
    } as any);

    mockUseLectures.mockReturnValue({
      data: { data: { lectures: [{ id: 'l1', slug: 'lecture-1', title: 'Lecture 1', order: 1, lessons: [] }] } },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    mockUseMyProgress.mockReturnValue({
      data: { data: { modules: [{ id: 'm1', lectureId: 'l1', status: 'completed' }] } },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: jest.fn(),
    } as any);
  });

  it('should unlock the first lecture by default', () => {
    const result = useHomeData();
    expect(result.isUnlocked(0)).toBe(true);
  });

  it('should unlock the second lecture if the first is completed', () => {
    const result = useHomeData();
    expect(result.isUnlocked(1)).toBe(true);
  });

  it('should keep the second lecture locked if the first is not completed', () => {
    mockUseMyProgress.mockReturnValue({
      data: { data: { modules: [{ id: 'm1', lectureId: 'l1', status: 'in_progress' }] } },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    const result = useHomeData();
    expect(result.isUnlocked(1)).toBe(false);
  });
});
