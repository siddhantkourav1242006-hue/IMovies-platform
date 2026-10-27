// Generate Booking ID: e.g. IMV-20261027-4821
exports.generateBookingId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `IMV-${year}${month}${day}-${random}`;
};
