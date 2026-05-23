import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadProgress, saveProgress, DEFAULT_PROGRESS } from './progress';

class MemStorage {
	private map = new Map<string, string>();
	getItem(k: string) {
		return this.map.get(k) ?? null;
	}
	setItem(k: string, v: string) {
		this.map.set(k, v);
	}
	removeItem(k: string) {
		this.map.delete(k);
	}
	clear() {
		this.map.clear();
	}
	key() {
		return null;
	}
	get length() {
		return this.map.size;
	}
}

describe('progress storage', () => {
	let storage: MemStorage;
	beforeEach(() => {
		storage = new MemStorage();
	});

	it('returns defaults when storage is empty', () => {
		expect(loadProgress(storage as unknown as Storage)).toEqual(DEFAULT_PROGRESS);
	});

	it('round-trips a valid save', () => {
		const next = { ...DEFAULT_PROGRESS, highScore: 1234, currency: 56 };
		saveProgress(storage as unknown as Storage, next);
		expect(loadProgress(storage as unknown as Storage)).toEqual(next);
	});

	it('returns defaults and warns on corrupt JSON', () => {
		storage.setItem('hueline.progress', '{not json');
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		expect(loadProgress(storage as unknown as Storage)).toEqual(DEFAULT_PROGRESS);
		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});

	it('returns defaults and warns on schema mismatch', () => {
		storage.setItem('hueline.progress', JSON.stringify({ version: 1, foo: 'bar' }));
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		expect(loadProgress(storage as unknown as Storage)).toEqual(DEFAULT_PROGRESS);
		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});
});
