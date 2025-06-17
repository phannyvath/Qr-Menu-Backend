const express = require("express");
const router = express.Router();
const {
  getSalesReport,
  getTableUtilizationReport,
  getPopularItemsReport,
  getHourlySalesReport,
  getCategoryPerformanceReport,
  getCustomerBehaviorReport
} = require("../controllers/reportController");

/**
 * @swagger
 * /api/report/sales:
 *   post:
 *     tags: [Reports]
 *     summary: Get sales report for a date range
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - webID
 *               - startDate
 *               - endDate
 *             properties:
 *               webID:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Sales report generated successfully
 */
router.post("/sales", getSalesReport);

/**
 * @swagger
 * /api/report/table-utilization:
 *   post:
 *     tags: [Reports]
 *     summary: Get table utilization report for a date range
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - webID
 *               - startDate
 *               - endDate
 *             properties:
 *               webID:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Table utilization report generated successfully
 */
router.post("/table-utilization", getTableUtilizationReport);

/**
 * @swagger
 * /api/report/popular-items:
 *   post:
 *     tags: [Reports]
 *     summary: Get popular items report for a date range
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - webID
 *               - startDate
 *               - endDate
 *             properties:
 *               webID:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Popular items report generated successfully
 */
router.post("/popular-items", getPopularItemsReport);

/**
 * @swagger
 * /api/report/hourly-sales:
 *   post:
 *     tags: [Reports]
 *     summary: Get hourly sales report for a date range
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - webID
 *               - startDate
 *               - endDate
 *             properties:
 *               webID:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Hourly sales report generated successfully
 */
router.post("/hourly-sales", getHourlySalesReport);

/**
 * @swagger
 * /api/report/category-performance:
 *   post:
 *     tags: [Reports]
 *     summary: Get category performance report for a date range
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - webID
 *               - startDate
 *               - endDate
 *             properties:
 *               webID:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Category performance report generated successfully
 */
router.post("/category-performance", getCategoryPerformanceReport);

/**
 * @swagger
 * /api/report/customer-behavior:
 *   post:
 *     tags: [Reports]
 *     summary: Get customer behavior report for a date range
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - webID
 *               - startDate
 *               - endDate
 *             properties:
 *               webID:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Customer behavior report generated successfully
 */
router.post("/customer-behavior", getCustomerBehaviorReport);

module.exports = router; 