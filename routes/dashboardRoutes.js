import express from 'express';
import {
  getDashboardStats,
  getRecentSales,
  getWeeklyRevenue,
  getTopProducts,
  getCategoriesWithProducts,
  getSalesStatus,
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/recent-sales', getRecentSales);
router.get('/weekly-revenue', getWeeklyRevenue);
router.get('/top-products', getTopProducts);
router.get('/categories', getCategoriesWithProducts);
router.get('/sales-status', getSalesStatus);

export default router;
