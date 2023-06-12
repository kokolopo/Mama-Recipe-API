const express = require("express");
const usersController = require("../controllers/users_controller");
const categoriesController = require("../controllers/categories_controller");
const recipesController = require("../controllers/recipes_controller");
const { verifyToken, isOwner } = require("../middleware/verify_token");
const { uploadImages } = require("../middleware/upload_image");
const router = express.Router();

// users
router.post("/users", usersController.register);
router.put("/users", verifyToken, usersController.editProfile);
router.post("/login", usersController.login);
router.put(
  "/photo",
  uploadImages.single("image"),
  verifyToken,
  usersController.changePhoto
);

// recipe
router.post(
  "/recipes",
  uploadImages.single("image"),
  verifyToken,
  recipesController.addRecipe
);
router.get("/recipes", verifyToken, recipesController.listRecipes);
router.put(
  "/recipes/:recipe_id",
  uploadImages.single("image"),
  isOwner,
  recipesController.editRecipe
);
router.delete("/recipes/:recipe_id", isOwner, recipesController.deleteRecipe);
router.get("/my-recipes", verifyToken, recipesController.myRecipes);

// category
router.post("/categories", categoriesController.add);

module.exports = router;
