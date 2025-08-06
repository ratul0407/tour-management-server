import { deleteImgFromCloudinary } from "../../config/cloudinary.config";
import { QueryBuilder } from "../../utils/queryBuilder";
import {
  tourSearchableFields,
  tourTypeSearchableFields,
} from "./tour.constant";
import { ITour, ITourType } from "./tour.interface";
import { Tour, TourType } from "./tour.model";

const createTour = async (payload: ITour) => {
  const existingTour = await Tour.findOne({ title: payload.title });
  if (existingTour) {
    throw new Error("A tour with this title already exists");
  }
  const tour = await Tour.create(payload);
  return tour;
};

const getAllTours = async (query: Record<string, string>) => {
  // const filter = query;
  // const searchTerm = query.searchTerm || "";
  // const sort = query.sort || "-createdAt";
  // const fields = query.fields?.split(",").join(" ") || "";
  // const page = Number(query.page) || 1;
  // const limit = Number(query.limit) || 10;
  // const skip = (page - 1) * limit;
  // console.log(skip, limit);

  // for (const field of excludedFields) {
  //   delete filter[field];
  // }
  // const searchQuery = {
  //   $or: tourSearchableFields.map((field) => ({
  //     [field]: { $regex: searchTerm, $options: "i" },
  //   })),
  // };
  // console.log(filter);
  // const tours = await Tour.find(searchQuery)
  //   .find(filter)
  //   .sort(sort)
  //   .select(fields)
  //   .skip(skip)
  //   .limit(limit);
  // const totalTours = await Tour.countDocuments();
  // const meta = {
  //   page,
  //   limit,
  //   totalTours,
  //   totalPage: Math.ceil(totalTours / limit),
  // };
  // return {
  //   data: tours,
  //   meta,
  // };
  const queryBuilder = new QueryBuilder(Tour.find(), query);
  console.log(query);
  const tours = await queryBuilder
    .search(tourSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  // const meta = await queryBuilder.getMeta();

  const [data, meta] = await Promise.all([
    tours.build(),
    queryBuilder.getMeta(),
  ]);
  return {
    data,
    meta,
  };
};

const getSingleTour = async (slug: string) => {
  const tour = await Tour.findOne({ slug });
  return tour;
};
const updateTour = async (id: string, payload: Partial<ITour>) => {
  const existingTour = await Tour.findById(id);
  if (!existingTour) {
    throw new Error("Tour doesn't exist");
  }
  if (
    payload.images &&
    payload.images.length > 0 &&
    existingTour.images &&
    existingTour.images.length > 0
  ) {
    payload.images = [...payload.images, ...existingTour.images];
  }
  if (
    payload.deleteImages &&
    payload.deleteImages.length > 0 &&
    existingTour.images &&
    existingTour.images.length > 0
  ) {
    const restDBImages = existingTour.images.filter(
      (imgUrl) => !payload.deleteImages?.includes(imgUrl)
    );
    const updatedPayloadImage = (payload.images || [])
      .filter((imgUrl) => !payload.deleteImages?.includes(imgUrl))
      .filter((imgUrl) => !restDBImages?.includes(imgUrl));
    payload.images = [...restDBImages, ...updatedPayloadImage];
  }

  const updatedTour = await Tour.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (
    payload.deleteImages &&
    payload.deleteImages.length > 0 &&
    existingTour.images &&
    existingTour.images.length > 0
  ) {
    await Promise.all(
      payload.deleteImages.map((img) => deleteImgFromCloudinary(img))
    );
  }
  return updatedTour;
};

const deleteTour = async (id: string) => {
  await Tour.findByIdAndDelete(id);
  return null;
};

/// --------------- Tour Type ---------------------
const createTourType = async (payload: ITourType) => {
  const name = payload.name;
  const existingTourType = await TourType.findOne({ name });
  if (existingTourType) {
    throw new Error("This tour type already exists");
  }
  const result = TourType.create({ name });
  return result;
};

const getAllTourType = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(TourType.find(), query);

  const tourTypes = await queryBuilder
    .search(tourTypeSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    tourTypes.build(),
    queryBuilder.getMeta(),
  ]);
  return {
    data,
    meta,
  };
};

const updateTourType = async (id: string, payload: ITourType) => {
  console.log(payload);
  const existingTourType = await TourType.findById(id);
  console.log(existingTourType);
  if (!existingTourType) {
    throw new Error("Tour Type was not Found!");
  }
  const updatedTour = await TourType.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return updatedTour;
};
const deleteTourType = async (id: string) => {
  console.log(id);
  await TourType.findByIdAndDelete(id);
  return null;
};
export const TourService = {
  createTour,
  getAllTours,
  getSingleTour,
  updateTour,
  deleteTour,
  createTourType,
  getAllTourType,
  updateTourType,
  deleteTourType,
};
