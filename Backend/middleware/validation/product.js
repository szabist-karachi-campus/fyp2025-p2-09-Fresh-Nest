const { check, validationResult } = require("express-validator");

exports.validateProduct = [
  check("name")
    .notEmpty()
    .withMessage("Product name is required!")
    .isString()
    .withMessage("Product name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters long"),

  check("price")
    .notEmpty()
    .withMessage("Price is required!")
    .isNumeric()
    .withMessage("Price must be a number!")
    .isFloat({ min: 0 })
    .withMessage("Price must be greater than or equal to 0"),

  check("description")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Description must be a valid string")
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),

  check("category")
    .notEmpty()
    .withMessage("Category is required!")
    .isString()
    .withMessage("Category must be a valid string")
    .isLength({ min: 2, max: 50 })
    .withMessage("Category must be between 2 and 50 characters long"),
];

exports.Validation = (req, res, next) => {
  const result = validationResult(req).array();
  if (!result.length) {
    return next();
  }

  const error = result[0].msg;
  console.log(result);
  res.status(400).json({ success: false, message: error });
};
