const Car = require('../models/Car');
const { calculateDynamicPrice } = require('../utils/pricing');
exports.getDynamicPricing = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }
    const pricing = await calculateDynamicPrice(car, new Date(startDate), new Date(endDate));
    res.json(pricing);
  } catch (error) { res.status(500).json({ error: error.message }); }
};
