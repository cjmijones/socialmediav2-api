// services/newsService.js
import axios from "axios";
import Article from "../models/Article.js";

const getNewsArticles = async () => {
  try {
    const response = await axios.get("https://newsapi.org/v2/top-headlines", {
      params: {
        country: "us", // You can change this to your preferred country
        pageSize: 5, // Limits the number of articles to 5
        apiKey: process.env.NEWS_API_KEY,
      },
    });
    return response.data.articles;
  } catch (error) {
    console.error("Error fetching news articles:", error.message);
    throw error;
  }
};

const saveNewsArticles = async () => {
  try {
    const articles = await getNewsArticles();

    for (const articleData of articles) {
      await Article.findOneAndUpdate(
        { url: articleData.url }, // Unique identifier to prevent duplicates
        { $set: articleData },
        { upsert: true, new: true }
      );
    }

    console.log("News articles have been updated.");
  } catch (error) {
    console.error("Error saving news articles:", error.message);
  }
};

export { getNewsArticles, saveNewsArticles };
