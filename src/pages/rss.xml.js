import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  const sorted = posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'Dmytro Klevakin',
    description: 'Cloud architecture, DevOps, AI and automation — notes from Dnipro.',
    site: context.site,
    items: sorted.map(post => ({
      title:       post.data.title,
      pubDate:     post.data.date,
      description: post.data.description,
      link:        `/writing/${post.id}/`,
    })),
  });
}
