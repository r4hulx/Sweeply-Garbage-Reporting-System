const Report = require('../models/Report');

const createReport = async (req, res) => {
  try {
    const { location, imageUrl, description } = req.body;
    if (!location || !imageUrl || !description) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const report = await Report.create({
      citizen: req.user.id,
      location,
      imageUrl,
      description,
      status: 'Reported',
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating report' });
  }
};

const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ citizen: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching reports' });
  }
};

const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching reports' });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { status, cleanedImageUrl } = req.body; // Extract the proof image
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status || report.status;
    report.cleaner = req.user.id;
    
    // Save the proof image if provided
    if (cleanedImageUrl) {
        report.cleanedImageUrl = cleanedImageUrl;
    }

    const updatedReport = await report.save();
    res.status(200).json(updatedReport);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating report' });
  }
};

module.exports = { createReport, getMyReports, getAllReports, updateReportStatus };