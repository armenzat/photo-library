import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    service = TestBed.inject(StorageService);
  });

  afterEach(() => localStorage.clear());

  it('should return the fallback for a missing key', () => {
    expect(service.get('missing', ['fallback'])).toEqual(['fallback']);
  });

  it('should round-trip a value', () => {
    service.set('key', { a: [1, 2, 3] });

    expect(service.get('key', null)).toEqual({ a: [1, 2, 3] });
  });

  it('should store the value as JSON', () => {
    service.set('key', ['1', '2']);

    expect(localStorage.getItem('key')).toBe('["1","2"]');
  });

  it('should return the fallback when the stored value is not valid JSON', () => {
    localStorage.setItem('key', '{not json');

    expect(service.get('key', 'fallback')).toBe('fallback');
  });
});
