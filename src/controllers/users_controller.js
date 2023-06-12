const prisma = require("../db/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateRandomString = require("../util/random_string");
const { uploadFile, MinioClient } = require("../util/object_storage");

const usersController = {
  register: async (req, res) => {
    const { name, email, phone, password, confPassword } = req.body;
    if (password !== confPassword)
      return res.status(400).json({ msg: "password invalid" });

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    try {
      const result = await prisma.users.create({
        data: {
          name,
          email,
          password: hashPassword,
          phone,
          photo:
            "https://cdn.icon-icons.com/icons2/3446/PNG/512/account_profile_user_avatar_icon_219236.png",
        },
      });

      res.json({ message: "Registrasi Berhasil", data: result });
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong",
        error,
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await prisma.users.findUnique({
        where: {
          email: email,
        },
      });
      if (!user) return res.status(400).json({ msg: "email tidak ditemukan!" });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ msg: "password salah!" });

      const { id, name, role } = user;
      const accessToken = jwt.sign(
        { id, name, email, role },
        process.env.ACCESS_TOKEN,
        {
          expiresIn: "1d",
        }
      );
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res
        .status(200)
        .json({ message: "Berhasil Login", data: user, token: accessToken });
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong",
        error,
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  changePhoto: async (req, res) => {
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

      const result = await prisma.users.update({
        data: { photo: presignedUrl },
        where: { id: user.payload.id },
      });

      res.status(200).json({ message: "Berhasil Ubah Photo", result });
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong",
        error,
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  editProfile: async (req, res) => {
    const { name, email, phone } = req.body;

    const token = req.cookies.accessToken;
    if (!token) {
      res.status(400).json({ msg: "g ada accessToken!" });
      return;
    }
    const user = jwt.decode(token, { complete: true });

    try {
      const result = await prisma.users.update({
        data: { name, email, phone },
        where: { id: user.payload.id },
      });

      res.status(200).json({ message: "Berhasil Ubah Photo", result });
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

module.exports = usersController;
