"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourService = void 0;
const cloudinary_config_1 = require("../../config/cloudinary.config");
const queryBuilder_1 = require("../../utils/queryBuilder");
const tour_constant_1 = require("./tour.constant");
const tour_model_1 = require("./tour.model");
const createTour = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTour = yield tour_model_1.Tour.findOne({ title: payload.title });
    if (existingTour) {
        throw new Error("A tour with this title already exists");
    }
    const tour = yield tour_model_1.Tour.create(payload);
    return tour;
});
const getAllTours = (query) => __awaiter(void 0, void 0, void 0, function* () {
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
    const queryBuilder = new queryBuilder_1.QueryBuilder(tour_model_1.Tour.find(), query);
    console.log(query);
    const tours = yield queryBuilder
        .search(tour_constant_1.tourSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    // const meta = await queryBuilder.getMeta();
    const [data, meta] = yield Promise.all([
        tours.build(),
        queryBuilder.getMeta(),
    ]);
    return {
        data,
        meta,
    };
});
const getSingleTour = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const tour = yield tour_model_1.Tour.findOne({ slug });
    return tour;
});
const updateTour = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTour = yield tour_model_1.Tour.findById(id);
    if (!existingTour) {
        throw new Error("Tour doesn't exist");
    }
    if (payload.images &&
        payload.images.length > 0 &&
        existingTour.images &&
        existingTour.images.length > 0) {
        payload.images = [...payload.images, ...existingTour.images];
    }
    if (payload.deleteImages &&
        payload.deleteImages.length > 0 &&
        existingTour.images &&
        existingTour.images.length > 0) {
        const restDBImages = existingTour.images.filter((imgUrl) => { var _a; return !((_a = payload.deleteImages) === null || _a === void 0 ? void 0 : _a.includes(imgUrl)); });
        const updatedPayloadImage = (payload.images || [])
            .filter((imgUrl) => { var _a; return !((_a = payload.deleteImages) === null || _a === void 0 ? void 0 : _a.includes(imgUrl)); })
            .filter((imgUrl) => !(restDBImages === null || restDBImages === void 0 ? void 0 : restDBImages.includes(imgUrl)));
        payload.images = [...restDBImages, ...updatedPayloadImage];
    }
    const updatedTour = yield tour_model_1.Tour.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    if (payload.deleteImages &&
        payload.deleteImages.length > 0 &&
        existingTour.images &&
        existingTour.images.length > 0) {
        yield Promise.all(payload.deleteImages.map((img) => (0, cloudinary_config_1.deleteImgFromCloudinary)(img)));
    }
    return updatedTour;
});
const deleteTour = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield tour_model_1.Tour.findByIdAndDelete(id);
    return null;
});
/// --------------- Tour Type ---------------------
const createTourType = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const name = payload.name;
    const existingTourType = yield tour_model_1.TourType.findOne({ name });
    if (existingTourType) {
        throw new Error("This tour type already exists");
    }
    const result = tour_model_1.TourType.create({ name });
    return result;
});
const getAllTourType = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new queryBuilder_1.QueryBuilder(tour_model_1.TourType.find(), query);
    const tourTypes = yield queryBuilder
        .search(tour_constant_1.tourTypeSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        tourTypes.build(),
        queryBuilder.getMeta(),
    ]);
    return {
        data,
        meta,
    };
});
const updateTourType = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(payload);
    const existingTourType = yield tour_model_1.TourType.findById(id);
    console.log(existingTourType);
    if (!existingTourType) {
        throw new Error("Tour Type was not Found!");
    }
    const updatedTour = yield tour_model_1.TourType.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return updatedTour;
});
const deleteTourType = (id) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(id);
    yield tour_model_1.TourType.findByIdAndDelete(id);
    return null;
});
exports.TourService = {
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
