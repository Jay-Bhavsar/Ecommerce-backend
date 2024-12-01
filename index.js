const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDb = require("./config/db");
const Products = require("./models/Products");
const Categories = require("./models/Categories");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

connectDb();

// Initial route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Initial route",
  });
});


app.get("/api/get/categories", async (req, res) => {
  try {
    const categories = await Categories.find();
    
    if (categories.length === 0) {
      return res.status(404).json({ message: "No categories found" });
    }

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//get All products
app.get("/api/products", async (req, res) => {
  const { page = 1, limit = 5, categoryName } = req.query;
  const skip = (page - 1) * limit;

  try {
    let query = {};

    if (categoryName) {
      const category = await Categories.findOne({ name: categoryName });
      if (category) {
        query.category = category._id;
      } else {
        return res.status(404).json({ error: `Category "${categoryName}" not found` });
      }
    }

    const products = await Products.find(query).skip(skip).limit(parseInt(limit));
    const totalProducts = await Products.countDocuments(query);

    res.status(200).json({
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//get product by id
app.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Products.findOne({ _id: id }).populate(
      "category"
    );
    if (!product) {
      return res.status(404).json({ error: `Product with id ${id} not found` });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// request to create product
app.post("/products", async (req, res) => {
  const { id, title, price, description, categoryId, image, rating } = req.body;
  try {
    const categoryExists = await mongoose
      .model("Category")
      .exists({ _id: categoryId });
    if (!categoryExists) {
      return res
        .status(400)
        .json({ error: `Category with ID "${categoryId}" does not exist` });
    }

    const newProduct = new Products({
      id,
      title,
      price,
      description,
      category: categoryId,
      image,
      rating,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST request for adding a category
app.post("/categories", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Category name is required" });
  }

  try {
    const newCategory = new Categories({ name });
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get Product By Category Name
app.get("/api/products/category/:categoryName", async (req, res) => {
  const { categoryName } = req.params;

  try {
    const category = await Categories.findOne({ name: categoryName });
    if (!category) {
      return res
        .status(404)
        .json({ error: `Category "${categoryName}" not found` });
    }

    const products = await Products.find({ category: category._id });

    if (products.length === 0) {
      return res
        .status(404)
        .json({
          message: `No products found in the "${categoryName}" category`,
        });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});
