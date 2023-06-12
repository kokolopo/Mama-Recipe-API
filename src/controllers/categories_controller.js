const prisma = require("../db/prisma");

const categoriesController = {
  add: async (req, res) => {
    const { name } = req.body;
    try {
      const result = await prisma.categories.create({
        data: {
          name,
        },
      });
      res.json({ message: "berhasil!", data: result });
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong",
        error,
      });
    } finally {
      await prisma.$disconnect();
    }
  },
};

module.exports = categoriesController;
