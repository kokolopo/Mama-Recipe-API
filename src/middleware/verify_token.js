const jwt = require("jsonwebtoken");
const prisma = require("../db/prisma");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return res.status(401).json({ message: "Unauthorization" });

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.email = decoded.email;

    next();
  });
};

const isOwner = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  try {
    const recipe = await prisma.recipes.findFirst({
      where: { id: parseInt(req.params.recipe_id) },
    });

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      if (decoded.id !== recipe.userId) {
        return res.sendStatus(403);
      }

      next();
    });
  } catch (error) {
    return res.status(403).json({ message: "Forbidden", error });
  }
};

module.exports = { verifyToken, isOwner };
