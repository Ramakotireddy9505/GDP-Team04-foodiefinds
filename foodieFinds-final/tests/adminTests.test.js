const {
    addRestaurant,
    deleteRestaurant,
    addFood,
    deleteRestaurantFood,
    getAllReservations,
    getAllUsers,
    blockUser,
    unblockUser,
} = require('../src/Controllers/Controllers.js');

const email = process.env.TESTING_EMAIL;
const pass = process.env.TESTING_PASS;
const dummyEmail = process.env.DUMMY_EMAIL;
const dummyPass = process.env.DUMMY_PASS;

const Restaurant = require('../src/Models/RestaurantModel.js');
const UserModel = require('../src/Models/userModel.js');
const bcrypt = require('bcryptjs');
const emailService = require('../src/emails.js');

jest.mock('../src/Models/RestaurantModel.js');
jest.mock('../src/Models/userModel.js');
jest.mock('../src/emails.js');
jest.mock('bcryptjs');

describe("Restaurant and Admin Controllers", () => {
    let req, res;

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe("addRestaurant", () => {
        it("should add a new restaurant", async () => {
            req = {
                body: { restaurantName: "Test Restaurant", contactNumber: "1234567890", address: "123 Street", rating: 4.5, feedback: "Great!", openingHours: "9 AM - 9 PM" },
                file: { path: "image/path.jpg" },
            };
            Restaurant.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(req.body),
            }));

            await addRestaurant(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Restaurant added successfully' }));
        });
    });

    describe("deleteRestaurant", () => {
        it("should delete a restaurant by ID", async () => {
            req = { params: { id: "restaurant123" } };
            Restaurant.findByIdAndDelete.mockResolvedValue({});

            await deleteRestaurant(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Restaurant deleted successfully' });
        });
    });

    describe("addFood", () => {
        it("should add a food item to the restaurant", async () => {
            req = {
                body: { restaurantId: "restaurant123", foodName: "Pizza", price: 10, description: "Delicious pizza", category: "Main Course" },
                file: { path: "food/image/path.jpg" },
            };
            const mockRestaurant = { foods: [], save: jest.fn().mockResolvedValue(true) };
            Restaurant.findById.mockResolvedValue(mockRestaurant);

            await addFood(req, res);

            expect(mockRestaurant.foods).toContainEqual(expect.objectContaining({ foodName: "Pizza", price: 10 }));
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it("should handle restaurant not found", async () => {
            req = { body: { restaurantId: "nonexistentId" } };
            Restaurant.findById.mockResolvedValue(null);

            await addFood(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe("deleteRestaurantFood", () => {
        it("should delete a food item from a restaurant", async () => {
            req = { query: { restaurantId: "restaurant123", foodName: "Pizza", price: "10" } };
            const mockRestaurant = {
                foods: [{ foodName: "Pizza", price: 10 }],
                save: jest.fn().mockResolvedValue(true),
            };
            Restaurant.findById.mockResolvedValue(mockRestaurant);

            await deleteRestaurantFood(req, res);

            expect(mockRestaurant.foods).toHaveLength(0);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("should handle food item not found", async () => {
            req = { query: { restaurantId: "restaurant123", foodName: "Nonexistent", price: "10" } };
            const mockRestaurant = { foods: [{ foodName: "Pizza", price: 10 }] };
            Restaurant.findById.mockResolvedValue(mockRestaurant);

            await deleteRestaurantFood(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });


    describe("getAllUsers", () => {
        it("should retrieve all users", async () => {
            UserModel.find.mockResolvedValue([{ _id: "user123" }]);

            await getAllUsers(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Users Fetched' }));
        });
    });

    describe("blockUser", () => {
        it("should block a user", async () => {
            req = { query: { userId: "user123" } };
            const mockUser = { blocked: false, save: jest.fn().mockResolvedValue(true) };
            UserModel.findById.mockResolvedValue(mockUser);

            await blockUser(req, res);

            expect(mockUser.blocked).toBe(true);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe("unblockUser", () => {
        it("should unblock a user", async () => {
            req = { query: { userId: "user123" } };
            const mockUser = { blocked: true, save: jest.fn().mockResolvedValue(true) };
            UserModel.findById.mockResolvedValue(mockUser);

            await unblockUser(req, res);

            expect(mockUser.blocked).toBe(false);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
