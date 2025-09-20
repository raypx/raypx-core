import {
  defineCollections,
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";
import { z } from "zod";

export const docs = defineDocs({
  docs: {
    schema: frontmatterSchema,
  },
  meta: {
    schema: metaSchema.extend({
      description: z.string().optional(),
    }),
  },
});

export const changelog = defineCollections({
  type: "doc",
  dir: "content/changelog",
  schema: frontmatterSchema.extend({
    version: z.string(),
    date: z.date(),
    published: z.boolean().default(true),
  }),
});

export const pages = defineCollections({
  type: "doc",
  dir: "content/pages",
  schema: frontmatterSchema.extend({
    date: z.date(),
    published: z.boolean().default(true),
  }),
});

export const blog = defineCollections({
  type: "doc",
  dir: "content/blog",
  schema: frontmatterSchema.extend({
    date: z.date(),
    published: z.boolean().default(true),
  }),
});

export default defineConfig({
  lastModifiedTime: "git",
});
