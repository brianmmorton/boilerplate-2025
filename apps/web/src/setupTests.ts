// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock fetch for tests
global.fetch = jest.fn(() =>
	Promise.resolve({
		json: () => Promise.resolve({}),
		ok: true,
		status: 200,
		clone: () => ({
			json: () => Promise.resolve({}),
		}),
	}),
) as jest.Mock;

// Setup any other test environment needs here
