import { TestBed } from '@angular/core/testing';
import { FAVORITES_STORAGE_KEY, FavoritesService } from './favorites';

describe('FavoritesService', () => {
  const stored = () => JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? 'null');
  const create = () => TestBed.inject(FavoritesService);

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  describe('hydration', () => {
    it('should start empty', () => {
      expect(create().ids().size).toBe(0);
    });

    it('should load the stored ids', () => {
      localStorage.setItem(FAVORITES_STORAGE_KEY, '["3","7"]');

      expect([...create().ids()]).toEqual(['3', '7']);
    });

    it.each([
      ['corrupt JSON', '{nope'],
      ['a non-array value', '{"a":1}'],
      ['a null value', 'null'],
      ['an array with non-strings', '["1",2]'],
    ])('should start empty for %s', (_name, value) => {
      localStorage.setItem(FAVORITES_STORAGE_KEY, value);

      expect(create().ids().size).toBe(0);
    });

    it('should collapse duplicate stored ids', () => {
      localStorage.setItem(FAVORITES_STORAGE_KEY, '["1","1","2"]');

      expect([...create().ids()]).toEqual(['1', '2']);
    });
  });

  describe('add', () => {
    it('should add an id and return true', () => {
      const service = create();

      expect(service.add('5')).toBe(true);
      expect(service.has('5')).toBe(true);
    });

    it('should return false and keep a single entry when the id already exists', () => {
      const service = create();
      service.add('5');

      expect(service.add('5')).toBe(false);
      expect(service.ids().size).toBe(1);
    });

    it('should replace the set instance so signal consumers are notified', () => {
      const service = create();
      const before = service.ids();

      service.add('5');

      expect(service.ids()).not.toBe(before);
    });

    it('should keep the insertion order', () => {
      const service = create();

      service.add('9');
      service.add('2');
      service.add('5');

      expect([...service.ids()]).toEqual(['9', '2', '5']);
    });

    it('should persist the ids', () => {
      const service = create();

      service.add('1');
      service.add('2');

      expect(stored()).toEqual(['1', '2']);
    });
  });

  describe('remove', () => {
    it('should remove an id and persist the change', () => {
      const service = create();
      service.add('1');
      service.add('2');

      service.remove('1');

      expect(service.has('1')).toBe(false);
      expect(stored()).toEqual(['2']);
    });

    it('should leave the set untouched when the id is not a favorite', () => {
      const service = create();
      service.add('1');
      const before = service.ids();

      service.remove('99');

      expect(service.ids()).toBe(before);
    });
  });

  describe('persistence', () => {
    it('should restore favorites in a new service instance', () => {
      create().add('4');
      TestBed.resetTestingModule();

      expect(create().has('4')).toBe(true);
    });
  });

  describe('cross-tab sync', () => {
    const fireStorageEvent = (key: string | null) =>
      window.dispatchEvent(new StorageEvent('storage', { key }));

    it('should pick up changes made by another tab', () => {
      const service = create();
      localStorage.setItem(FAVORITES_STORAGE_KEY, '["8","9"]');

      fireStorageEvent(FAVORITES_STORAGE_KEY);

      expect([...service.ids()]).toEqual(['8', '9']);
    });

    it('should reset when storage is cleared in another tab', () => {
      const service = create();
      service.add('1');
      localStorage.clear();

      fireStorageEvent(null);

      expect(service.ids().size).toBe(0);
    });

    it('should ignore changes to other keys', () => {
      const service = create();
      service.add('1');
      const before = service.ids();
      localStorage.setItem('other', '1');

      fireStorageEvent('other');

      expect(service.ids()).toBe(before);
    });
  });
});
