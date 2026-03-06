"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();
const NEWS_API_KEY = process.env.NEWS_API_KEY || '81d6f5c5333144a49c90539665287f31'; // Using a demo key or requiring env var
const NEWS_URL = 'https://newsapi.org/v2/everything';
// Cache news to avoid hitting API limits
let cachedNews = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
router.get('/', async (req, res) => {
    try {
        const now = Date.now();
        if (cachedNews && (now - lastFetchTime < CACHE_DURATION)) {
            return res.json(cachedNews);
        }
        if (!NEWS_API_KEY) {
            logger_1.default.warn('NEWS_API_KEY is missing');
            return res.status(500).json({ error: 'News service not configured' });
        }
        const response = await axios_1.default.get(NEWS_URL, {
            params: {
                q: 'mental health OR psychology OR wellness OR mindfulness',
                language: 'en',
                sortBy: 'publishedAt',
                apiKey: NEWS_API_KEY
            }
        });
        const articles = response.data.articles.map((article, index) => ({
            id: `news-${index}-${Date.now()}`,
            title: article.title,
            type: 'article',
            category: 'News',
            author: article.source.name,
            image: article.urlToImage || 'https://images.unsplash.com/photo-1505373877741-e174b4fb1017?w=500&q=80',
            url: article.url,
            publishedAt: article.publishedAt
        }));
        cachedNews = articles;
        lastFetchTime = now;
        res.json(articles);
    }
    catch (error) {
        logger_1.default.error('Failed to fetch news from NewsAPI:', error.message);
        // Return mock data if API fails (e.g. rate limit)
        res.json([
            {
                id: 'mock-1',
                title: 'Understanding Anxiety: Top Tips for 2024',
                type: 'article',
                category: 'News',
                author: 'Health Daily',
                image: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=500&q=80',
                publishedAt: new Date().toISOString()
            }
        ]);
    }
});
exports.default = router;
//# sourceMappingURL=news.js.map