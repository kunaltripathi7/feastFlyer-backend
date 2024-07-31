import { Request, Response } from "express";
import Restaurant from "../models/restaurant";

const searchRestaurant = async (req: Request, res: Response) => {
  try {
    const city = req.params.city;
    const selectedCuisines = (req.query.selectedCuisines as string) || "";
    const searchQuery = (req.query.searchQuery as string) || "";

    const sortOption = (req.query.sortOption as string) || "lastUpdated";
    const page = parseInt(req.query.page as string) || 1;

    let query: any = {}; // building a query obj for mongoose.

    query["city"] = new RegExp(city, "i");
    // Resulting query object: { city: /New York/i }
    const cityCheck = await Restaurant.countDocuments(query);
    if (cityCheck === 0) {
      res.status(404).json({
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pageSize: 1,
        },
      });
    }

    if (selectedCuisines) {
      const cuisineArray = selectedCuisines
        .split(",")
        .map((cuisine) => new RegExp(cuisine, "i"));
      query["cuisines"] = { $all: cuisineArray };
    }

    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      query["$or"] = [
        { restaurantName: searchRegex },
        { cuisines: { $in: [searchRegex] } },
      ];
    }
    const pageSize = 10;
    const skip = (page - 1) * pageSize;
    const restaurants = await Restaurant.find(query)
      .sort({ [sortOption]: 1 })
      .skip(skip)
      .limit(pageSize)
      .lean(); // removes mongo's object Id stuff

    const total = await Restaurant.countDocuments(query);

    //pagination data along with response
    const response = {
      data: restaurants,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize),
      },
    };
    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default {
  searchRestaurant,
};