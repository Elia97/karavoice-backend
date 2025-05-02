const { Event, User, Booking } = require("../models");

exports.getDashboardData = async (req, res) => {
  const totalEvents = await Event.count();
  const totalUsers = await User.count();
  const totalBookings = await Booking.count();

  const recentEvents = await Event.findAll({
    order: [["createdAt", "DESC"]],
    limit: 4,
    attributes: ["id", "name", "createdAt"],
  });

  const latestBookings = await Booking.findAll({
    include: ["user", "event"], // assumendo che le relazioni siano settate
    order: [["createdAt", "DESC"]],
    limit: 4,
    attributes: ["id", "createdAt"],
  });

  res.json({
    totalEvents,
    totalUsers,
    totalBookings,
    recentEvents,
    latestBookings,
  });
};
