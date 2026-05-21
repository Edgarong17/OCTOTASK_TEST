import '@testing-library/jest-dom';

// Vitest uses Node's fetch implementation, which requires absolute URLs.
// This keeps existing app calls like '/api/..." working in tests.
const nativeFetch = globalThis.fetch;
if (nativeFetch) {
	globalThis.fetch = (input, init) => {
		if (typeof input === 'string' && input.startsWith('/')) {
			return nativeFetch(new URL(input, window.location.origin).toString(), init);
		}
		return nativeFetch(input, init);
	};
}
