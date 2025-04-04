const AppVersion = require("../models/appVersion");

const sendAppVersion = async (req, res) => {
  try {
    const response = await AppVersion.findOne({}).sort({ updatedAt: -1 });
    if (!response) {
      return res.status(404).json({ message: "No app version found" });
    }
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching app version:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const createAppVersion = async (req, res) => {
  try {
    const { version, apkUrl, mandatory } = req.body;
    if (!version || !apkUrl) {
      return res
        .status(400)
        .json({ message: "Version and APK URL are required" });
    }

    const newVersion = new AppVersion({
      version,
      apkUrl,
      mandatory: mandatory || false,
    });

    await newVersion.save();
    res.status(201).json(newVersion);
  } catch (error) {
    console.error("Error creating app version:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  sendAppVersion,
  createAppVersion,
};
