const prisma = require("../db/prisma");
const jwt = require("jsonwebtoken");
const generateRandomString = require("../util/random_string");
const { uploadFile, MinioClient } = require("../util/object_storage");

const recipesController = {
  addRecipe: async (req, res) => {
    const { title, ingredients, video } = req.body;

    const token = req.cookies.accessToken;
    if (!token) {
      res.status(400).json({ msg: "g ada accessToken!" });
      return;
    }
    const user = jwt.decode(token, { complete: true });

    try {
      const image_url = generateRandomString(10);
      uploadFile(req.file.path, image_url);
      console.log(image_url);

      const presignedUrl = await MinioClient.presignedGetObject(
        "foodimages",
        image_url
      );

      const result = await prisma.recipes.create({
        data: {
          user: { connect: { id: user.payload.id } },
          title,
          ingredients,
          image: presignedUrl,
          video,
        },
      });

      res.status(201).json({ message: "sukses", result });
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong",
        error,
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  listRecipes: async (req, res) => {
    try {
      let { page = 1, limit = 3, sort = "desc" } = req.query;
      let skip = (page - 1) * limit;

      const recipes = await prisma.recipes.findMany({
        orderBy: [{ id: sort }],
        take: parseInt(limit),
        skip: skip,
      });
      // total data
      const resultCount = await prisma.recipes.count();
      // total page
      const totalPage = Math.ceil(resultCount / limit);

      res.status(200).json({
        message: "list Recipes",
        total_data: resultCount,
        total_page: totalPage,
        current_page: parseInt(page),
        recipes,
      });
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong",
        error,
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  myRecipes: async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) {
      res.status(400).json({ msg: "g ada accessToken!" });
      return;
    }
    const user = jwt.decode(token, { complete: true });

    try {
      const recipes = await prisma.recipes.findMany({
        where: { userId: user.payload.id },
      });

      res.status(200).json({ message: "list Recipes", recipes });
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong",
        error,
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  editRecipe: async (req, res) => {
    const { recipe_id } = req.params;
    const { title, ingredients, video } = req.body;

    const token = req.cookies.accessToken;
    if (!token) {
      res.status(400).json({ msg: "g ada accessToken!" });
      return;
    }
    const user = jwt.decode(token, { complete: true });

    try {
      const image_url = generateRandomString(10);
      uploadFile(req.file.path, image_url);
      console.log(image_url);

      const presignedUrl = await MinioClient.presignedGetObject(
        "foodimages",
        image_url
      );

      const result = await prisma.recipes.update({
        where: { id: parseInt(recipe_id) },
        data: {
          title,
          ingredients,
          image: presignedUrl,
          video,
        },
      });
      res.status(200).json({ message: "berhasil diperbaharui", result });
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong",
        error,
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  deleteRecipe: async (req, res) => {
    try {
      await prisma.recipes.delete({
        where: { id: parseInt(req.params.recipe_id) },
      });

      res.status(200).json({ message: "berhasil dihapus" });
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

module.exports = recipesController;
