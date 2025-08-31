const express = require("express");
const Category = require("../models/category");

const router = express.Router();

router.post("/createCategory", async (req, res) => {
  const { name } = req.body;
  const category = await Category({
    name,
  });
  await category.save();
  res.json({
    success: true,
    message: "Category created successfully",
    category,
  });
});

router.get("/getCategories", async (req, res) => {
  const categories = await Category.find();
  res.json({
    success: true,
    categories,
  });
});

module.exports = router;
