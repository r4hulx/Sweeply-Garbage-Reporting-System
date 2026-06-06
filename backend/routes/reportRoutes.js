const express = require('express');
const router = express.Router();
const { createReport, getMyReports, getAllReports, updateReportStatus } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReport);
router.get('/myreports', protect, getMyReports);
router.get('/', protect, getAllReports);
router.put('/:id', protect, updateReportStatus);

module.exports = router;