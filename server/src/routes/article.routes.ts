import { Router } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// List articles by category (TICKER_ANNOUNCEMENT, HISTORICAL_MILESTONE, HEALTH_RESOURCE)
router.get('/', async (req, res) => {
  const { category } = req.query as Record<string, string>;

  try {
    const where: any = {};
    if (category) {
      where.category = category;
    }

    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: articles });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch articles.' });
  }
});

// Single Article by Slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const article = await prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      res.status(404).json({ success: false, error: 'Article not found.' });
      return;
    }

    res.json({ success: true, data: article });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch article.' });
  }
});

export default router;
