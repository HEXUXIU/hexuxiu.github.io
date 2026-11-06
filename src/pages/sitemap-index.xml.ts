import { SITE_URL } from "@constants/site";
import type { APIRoute } from "astro";
export const GET: APIRoute = async ({ site }) => {
	const siteUrl = site?.toString() || SITE_URL;
	const sitemaps = [
		"sitemap-pages.xml",
		"sitemap-posts.xml",
		"sitemap-taxonomies.xml",
	];
	// NOTE: sitemap-essays.xml and sitemap-series.xml are intentionally
	// NOT listed: the essays and seri collections are empty, so those two
	// sitemaps contain 0 URLs. Listing an empty sitemap in the index
	// wastes crawl budget and confuses indexers. If essays/series content
	// is ever added, re-add the corresponding entry here (the route files
	// src/pages/sitemap-essays.xml.ts and sitemap-series.xml.ts still
	// exist and will generate the sitemap).
	const now = new Date().toISOString();
	const sitemapItems = sitemaps
		.map(
			(s) => `  <sitemap>
    <loc>${new URL(s, siteUrl).toString()}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`,
		)
		.join("\n");
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapItems}
</sitemapindex>`;
	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
		},
	});
};
