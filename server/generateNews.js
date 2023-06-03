const axios = require("axios");
const cheerio = require("cheerio");
const NodeCache = require("node-cache");

const rssCache = new NodeCache();

async function generateNews() {
  // An array of URLs for websites that provide RSS feeds
  const urls = [
    "https://timesofindia.indiatimes.com/rssfeeds/2647163.cms", // Times of India - Agriculture News
    "https://economictimes.indiatimes.com/rssfeeds/12006559.cms", // Economic Times - Agriculture News
    "https://www.thehindubusinessline.com/news/variety/agri-business/?service=rss", // The Hindu Business Line - Agri-Business News
    "https://www.thehindubusinessline.com/economy/agri-business/?service=rss", // The Hindu Business Line - Economy Agri-Business News
    "https://www.ndtv.com/rss/india/agriculture", // NDTV - Agriculture News
    "https://www.agricultureworld.in/rss-feed.xml", // Agriculture World - News Feed
    "https://www.fnbnews.com/rss/newssector/4", // Food & Beverage News - Agriculture Sector
    "https://www.fnbnews.com/rss/newssector/16", // Food & Beverage News - Dairy Sector
    "https://www.fnbnews.com/rss/newssector/1", // Food & Beverage News - Foodgrains & Oilseeds Sector
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
