const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

async function generateSitemap(hostname) {
    const links = [
        { url: '/', changefreq: 'daily', priority: 1.0 },
        { url: '/about', changefreq: 'monthly', priority: 0.8 },
        { url: '/contact', changefreq: 'monthly', priority: 0.8 },
        { url: '/calculator', changefreq: 'monthly', priority: 0.8 },
        { url: '/policies', changefreq: 'weekly', priority: 0.9 },
        { url: '/policies/insurance', changefreq: 'weekly', priority: 0.8 },
        { url: '/policies/insurance/endowment', changefreq: 'weekly', priority: 0.8 },
        { url: '/policies/insurance/whole-life', changefreq: 'weekly', priority: 0.8 },
        { url: '/policies/insurance/money-back', changefreq: 'weekly', priority: 0.8 },
        { url: '/policies/insurance/term', changefreq: 'weekly', priority: 0.8 },
        { url: '/policies/pension', changefreq: 'weekly', priority: 0.8 },
        { url: '/policies/unit-linked', changefreq: 'weekly', priority: 0.8 },
        { url: '/policies/micro-insurance', changefreq: 'weekly', priority: 0.8 },
        { url: '/privacy-policy', changefreq: 'monthly', priority: 0.5 },
        { url: '/terms', changefreq: 'monthly', priority: 0.5 },
        { url: '/disclaimer', changefreq: 'monthly', priority: 0.5 },
        { url: '/cookie-policy', changefreq: 'monthly', priority: 0.5 },
        { url: '/legal', changefreq: 'monthly', priority: 0.5 },
        { url: '/sitemap', changefreq: 'monthly', priority: 0.3 }
    ];

    const stream = new SitemapStream({ hostname });
    return streamToPromise(Readable.from(links).pipe(stream)).then((data) =>
        data.toString()
    );
}

module.exports = generateSitemap;