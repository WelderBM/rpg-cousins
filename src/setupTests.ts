import "@testing-library/jest-dom";
import { expect, afterEach, beforeAll, afterAll } from "vitest";
import { cleanup } from "@testing-library/react";
import * as axeMatchers from "vitest-axe/matchers";
import "vitest-axe/extend-expect";
import { server } from "./mocks/server";

// Extend Vitest with axe-core matchers
expect.extend(axeMatchers);

expect.extend({
  toHaveUniqueElements(received: any[]) {
    const duplicates = received.filter(
      (item, index) => received.indexOf(item) !== index
    );
    const pass = duplicates.length === 0;
    if (pass) {
      return {
        message: () => `expected ${received} not to have unique elements`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to have unique elements, but found duplicates: ${duplicates}`,
        pass: false,
      };
    }
  },
});

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Clean up after the tests are finished.
afterAll(() => server.close());
