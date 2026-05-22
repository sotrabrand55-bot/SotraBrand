// In-memory maintenance state
let maintenance = false;

// GET /api/maintenance
export const getMaintenance = (req, res) => {
  try {
    res.status(200).json({ maintenance });
  } catch (err) {
    res.status(500).json({ message: "Failed to get maintenance status", error: err.message });
  }
};

// POST /api/maintenance
// Expects { active: true/false } in body
export const setMaintenance = (req, res) => {
  try {
    const { active } = req.body;
    if (typeof active !== "boolean") {
      return res.status(400).json({ message: "active must be a boolean" });
    }
    maintenance = active;
    res.status(200).json({ maintenance });
  } catch (err) {
    res.status(500).json({ message: "Failed to set maintenance status", error: err.message });
  }
};
