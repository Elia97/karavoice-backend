const { Category, Event, Sequelize } = require("../models");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Event,
          as: "events",
          attributes: [], // non carichiamo eventi, solo il count
        },
      ],
      attributes: {
        include: [
          [
            Sequelize.fn("COUNT", Sequelize.col("events.id")),
            "eventCount", // ALIAS obbligatorio
          ],
        ],
      },
      group: ["Category.id"],
      subQuery: false, // importante per evitare errori nel count
    });

    const formattedCategories = categories.map((category) => ({
      ...category.dataValues,
      eventCount: Number(category.get("eventCount")) || 0, // usa `.get()` per accedere a valori aliasati
    }));

    res.status(200).json(formattedCategories);
  } catch (error) {
    res.status(500).json({
      message: "Errore durante il recupero delle categorie",
      error: error.message,
    });
  }
};
