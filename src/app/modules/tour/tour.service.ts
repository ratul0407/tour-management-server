import { ITour, ITourType } from "./tour.interface";
import { Tour, TourType } from "./tour.model";

const createTour = async (payload: ITour) => {
  const existingTour = await Tour.findOne({ title: payload.title });
  if (existingTour) {
    throw new Error("A tour with this title already exists");
  }
  const baseSlug = payload.title.toLowerCase().split(" ").join("-");
  let slug = `${baseSlug}-division`;

  let counter = 0;
  while (await Tour.exists({ slug })) {
    slug = `${slug}-${counter++}`;
  }

  payload.slug = slug;
  const tour = await Tour.create(payload);
  return tour;
};

const getAllTours = async () => {
  const tours = await Tour.find({});
  const totalTours = await Tour.countDocuments();
  return {
    data: tours,
    meta: {
      totalTours,
    },
  };
};
const updateTour = async (id: string, payload: Partial<ITour>) => {
  const existingTour = await Tour.findById(id);
  if (!existingTour) {
    throw new Error("Tour doesn't exist");
  }

  if (payload.title) {
    const baseSlug = payload.title.toLowerCase().split(" ").join("-");
    let slug = `${baseSlug}-division`;
    let counter = 0;
    while (await Tour.exists({ slug })) {
      slug = `${slug}-${counter++}`;
    }
    payload.slug = slug;
  }
  const updatedTour = await Tour.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return updatedTour;
};

const deleteTour = async (id: string) => {
  await Tour.findById(id);
  return null;
};

/// --------------- Tour Type ---------------------
const createTourType = async (payload: ITourType) => {
  const existingTourType = await TourType.findOne({ name: payload });
  if (existingTourType) {
    throw new Error("This tour type already exists");
  }
  const result = TourType.create(payload);
  return result;
};

const getAllTourType = async () => {
  const tourTypes = await TourType.find({});
  const totalTourTypes = await TourType.countDocuments();
  return {
    data: tourTypes,
    meta: {
      totalTourTypes,
    },
  };
};

const updateTourType = async (id: string, payload: ITourType) => {
  const existingTourType = await TourType.find({ name: payload });
  if (existingTourType) {
    throw new Error("This tour type already exists");
  }
  const updatedTour = await TourType.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return updatedTour;
};
export const TourService = {
  createTour,
  getAllTours,
  updateTour,
  deleteTour,
  createTourType,
  getAllTourType,
  updateTourType,
};
