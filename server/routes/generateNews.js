const axios = require("axios");
const cheerio = require("cheerio");
const NodeCache = require("node-cache");

const rssCache = new NodeCache();

async function generateNews() {
  // An array of URLs for websites that provide RSS feeds
  const urls = [
    "https://timesofindia.indiatimes.com/rssfeeds/-2128672765.cms", // Times of India - Space News
    "https://economictimes.indiatimes.com/news/science/rssfeeds/39872847.cms",
    "http://rss.cnn.com/rss/edition_space.rss", // Economic Times - Space News
    "https://www.nasa.gov/rss/dyn/breaking_news.rss", // NASA Breaking News
    "https://spacenews.com/feed/", // SpaceNews
    "https://www.space.com/feeds/all", // Space.com
    "https://www.esa.int/Services/RSS", // European Space Agency (ESA) News
    "https://www.isro.gov.in/update/rss.xml", // ISRO News
    "https://www.spaceflightnow.com/feed/", // Spaceflight Now
    // Add more URLs for space news sources
  ];
  

  // An empty array to store the news items
  let newsItems = [];

  // Create an array of promises that fetch the RSS feeds
  const rssPromises = urls.map(async (url) => {
    let response;
    const cachedResponse = rssCache.get(url);
    if (cachedResponse) {
      response = { data: cachedResponse };
    } else {
      response = await axios.get(url, { timeout: 5000 });
      rssCache.set(url, response.data);
    }
    const $ = cheerio.load(response.data, { xmlMode: true });
    $("item").each((i, item) => {
      // Extract the required fields from the RSS item
      const postUrl = $(item).find("link").text();
      const title = $(item).find("title").text();
      const thumbnail =
        $(item).find("media\\:content, content").attr("url") ||
        $(item).find("enclosure").attr("url") ||
        $(item).find("image").attr("url") ||
        $(item).find("og:image").attr("content") ||
        $(item).find("twitter:image").attr("content") ||
        "https://via.placeholder.com/150"; // Default thumbnail

      const date = $(item).find("pubDate").text();

      // Add the news item to the array
      newsItems.push({ postUrl, title, thumbnail, date });
    });
  });

  // // Wait for all the RSS feeds to be fetched and then return the news items
  await Promise.allSettled(rssPromises);

  return newsItems;
}

module.exports = generateNews;
