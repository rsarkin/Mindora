import express from 'express';
import axios from 'axios';
import logger from '../utils/logger';

const router = express.Router();

const NEWS_API_KEY = process.env.NEWS_API_KEY || '81d6f5c5333144a49c90539665287f31'; // Using a demo key or requiring env var
const NEWS_URL = 'https://newsapi.org/v2/everything';

// Cache news to avoid hitting API limits
let cachedNews: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

router.get('/', async (req, res) => {
    try {
        const now = Date.now();
        if (cachedNews && (now - lastFetchTime < CACHE_DURATION)) {
            return res.json(cachedNews);
        }

        if (!NEWS_API_KEY) {
            logger.warn('NEWS_API_KEY is missing');
            return res.status(500).json({ error: 'News service not configured' });
        }

        const response = await axios.get(NEWS_URL, {
            params: {
                q: 'mental health OR psychology OR wellness OR mindfulness',
                language: 'en',
                sortBy: 'publishedAt',
                apiKey: NEWS_API_KEY
            }
        });

        const articles = response.data.articles.map((article: any, index: number) => ({
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
    } catch (error: any) {
        logger.error('Failed to fetch news from NewsAPI:', error.message);
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

export default router;
