import { shuffle } from './shuffle';

describe('shuffle', () => {
  afterEach(() => vi.restoreAllMocks());

  it('should return a permutation of the input', () => {
    const input = Array.from({ length: 50 }, (_, i) => i + 1);

    const result = shuffle(input);

    expect(result).toHaveLength(input.length);
    expect([...result].sort((a, b) => a - b)).toEqual(input);
  });

  it('should not mutate the input', () => {
    const input = [1, 2, 3, 4];

    shuffle(input);

    expect(input).toEqual([1, 2, 3, 4]);
  });

  it('should reorder using Math.random', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    expect(shuffle([1, 2, 3])).toEqual([2, 3, 1]);
  });

  it('should handle empty and single item arrays', () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle([7])).toEqual([7]);
  });
});
