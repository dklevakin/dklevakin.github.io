import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title:       z.string(),
    date:        z.coerce.date(),
    description: z.string(),
    category:    z.enum(['Cloud & DevOps', 'AI & vibe coding', 'Automation', 'Career']),
    draft:       z.boolean().default(false),
  }),
});

export const collections = { posts };
