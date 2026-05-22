let deliveryFee = 3; // default value

export const getDeliveryFee = (req, res) => {
  res.json({ delivery_fee: deliveryFee });
};

export const setDeliveryFee = (req, res) => {
  const { delivery_fee } = req.body;

  if (typeof delivery_fee !== "number") {
    return res.status(400).json({ message: "delivery_fee must be a number" });
  }

  deliveryFee = delivery_fee;
  res.json({ success: true, delivery_fee });
};
