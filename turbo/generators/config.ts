import type { PlopTypes } from "@turbo/gen";

import { createPackageGenerator } from "./templates/package/generator";

// List of generators to be registered
const generators = [
  // Add generators here
  createPackageGenerator,
];

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  for (const gen of generators) {
    gen(plop);
  }
}
