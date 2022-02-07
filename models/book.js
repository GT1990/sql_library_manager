"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Book.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "TITLE is required",
          },
        },
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "AUTHOR is required",
          },
        },
      },
      genre: DataTypes.STRING,
      year: {
        type: DataTypes.INTEGER,
        validate: {
          not: {
            arg: /^(\s*|\d+)$/,
            msg: "YEAR must be an integers",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Book",
    }
  );
  return Book;
};
