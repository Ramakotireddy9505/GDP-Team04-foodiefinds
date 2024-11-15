const bcrypt = require('bcryptjs');
const UserModel = require('../src/Models/userModel.js');
const RestaurantModel = require('../src/Models/RestaurantModel.js');
const emailService = require('../src/emails.js');

// Use environment variables for testing credentials
const email = process.env.TESTING_EMAIL;
const pass = process.env.TESTING_PASS;
const dummyEmail = process.env.DUMMY_EMAIL;
const dummyPass = process.env.DUMMY_PASS;

const {
    userLogin,
    createUserAccount,
    getUserProfile,
    updateUserProfile,
    deleteUserAccount,
    requestOTP,
    checkOTP,
    resetPassword,
    getRestaurant,
    getRestaurants,
    createReservation,
    deleteReservation,
    blockReservation,
    getAllReservationsByUserId,
    getReservationByUserAndId,
    getReservationById,
    getReservationsByDate,
    getReservationsByRestaurantId,
    addReview,
    deleteReview
} = require('../src/Controllers/userControllers.js');



jest.mock('../src/emails.js');
jest.mock('bcryptjs');
jest.mock('../src/Models/userModel.js');
jest.mock('../src/Models/RestaurantModel.js');

describe("User Authentication", () => {
    describe("userLogin function", () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it("should login successfully with correct credentials", async () => {
            const req = { body: { email: email, password: pass } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            const mockUser = { username: "testUser", _id: "12345" };

            // Mocking findByCredentials to return a user when credentials are correct
            UserModel.findByCredentials.mockResolvedValue(mockUser);

            await userLogin(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                response: "Login success",
                username: mockUser.username,
                userId: mockUser._id
            });
        });

        it("should respond with 401 for incorrect credentials", async () => {
            const req = { body: { email: "test@example.com", password: "wrongPassword" } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            // Mocking findByCredentials to return null or error message for incorrect password
            UserModel.findByCredentials.mockResolvedValue(null);

            await userLogin(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: "Incorrect credentials" });
        });

        it("should handle server error gracefully", async () => {
            const req = { body: { email: "test@example.com", password: "password123" } };
            const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

            // Mocking findByCredentials to throw an error
            UserModel.findByCredentials.mockRejectedValue(new Error("Database error"));

            await userLogin(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: new Error("Database error") });
        });
    });

    describe("createUserAccount function", () => {
        afterEach(() => {
            jest.clearAllMocks(); // Clear mocks after each test
        });

        it("should create a new user account successfully", async () => {
            const req = { body: { email: "newuser@gmail.com", password: "password123" } };
            const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

            const mockUser = { email: "newuser@gmail.com", password: "password123" };

            // Mock save function of user instance
            UserModel.prototype.save = jest.fn().mockResolvedValue(mockUser);

            await createUserAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ response: "Account created successfully" });
        });

       /* it("should return 500 if account creation fails", async () => {
            const req = { body: { email: "newuser@gmail.com", password: "password123" } };
            const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

            // Mock save to throw an error
            UserModel.prototype.save = jest.fn().mockRejectedValue(new Error("Database error"));

            await createUserAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: "Failed to create user account" });
        }); */

        it("should respond with 500 for missing request body", async () => {
            const req = {};
            const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

            await createUserAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: "Something went wrong" });
        });
    });

    describe("resetPassword Controller", () => {
        let req, res;
    
        beforeEach(() => {
            req = {
                body: { email: "test@example.com", password: "newPassword123" }
            };
            res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };
        });
    
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        test("should reset the password successfully if user is found", async () => {
            // Mock the UserModel.findOne to return a user object
            const user = { save: jest.fn() };
            UserModel.findOne.mockResolvedValue(user);
    
            await resetPassword(req, res);
    
            // Check that the password was updated
            expect(user.password).toBe("newPassword123");
    
            // Check response status and message
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                message: "Password updated successfully"
            });
        });
    
        test("should return 404 if user is not found", async () => {
            UserModel.findOne.mockResolvedValue(null);
    
            await resetPassword(req, res);
    
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: "User not found"
            });
        });
    });

});



describe('User Controllers', () => {

    describe('updateUserProfile', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('should update user profile successfully', async () => {
            const req = {
                params: { id: 'userId' },
                body: { username: 'newUser', email: 'new@example.com', password: 'newPassword' }
            };
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis()
            };

            UserModel.findById.mockResolvedValue({
                _id: 'userId',
                username: 'oldUser',
                email: 'old@example.com',
                save: jest.fn()
            });
            bcrypt.hash.mockResolvedValue('hashedPassword');

            await updateUserProfile(req, res);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Profile updated successfully',
                user: expect.objectContaining({ username: 'newUser', email: 'new@example.com' })
            });
        });

        it('should return 400 if username or email is missing', async () => {
            const req = { params: { id: 'userId' }, body: {} };
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis()
            };

            await updateUserProfile(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Username and email are required' });
        });
    });

    describe('deleteUserAccount', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('should delete user account successfully', async () => {
            const req = { params: { id: 'userId' } };
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis()
            };

            UserModel.findByIdAndDelete.mockResolvedValue({ _id: 'userId' });

            await deleteUserAccount(req, res);
            expect(res.json).toHaveBeenCalledWith({ message: 'Account deleted successfully' });
        });

       /* it('should return 404 if user is not found', async () => {
            const req = { params: { id: 'userId' } };
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis()
            };

            UserModel.findByIdAndDelete.mockResolvedValue(null);

            await deleteUserAccount(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });  */
    });

    describe('requestOTP', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('should send OTP successfully', async () => {
            const req = { body: { email: 'test@example.com' } };
            const res = {
                send: jest.fn(),
                status: jest.fn().mockReturnThis()
            };

            emailService.sendOTP.mockResolvedValue(true);

            await requestOTP(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: 'OTP sent - test@example.com' }));
        });
    });
});



describe("RestaurantModel Controller Tests", () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getRestaurants", () => {
        test("should return restaurants if found", async () => {
            RestaurantModel.find.mockResolvedValue([{ name: "Test RestaurantModel" }]);
            
            await getRestaurants(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Restaurants retrieved successfully',
                restaurants: [{ name: "Test RestaurantModel" }]
            });
        });

        test("should return 201 if no restaurants found", async () => {
            RestaurantModel.find.mockResolvedValue([]);
            
            await getRestaurants(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Empty restaurants'
            });
        });

      /*  test("should return 500 if there is a server error", async () => {
            RestaurantModel.find.mockRejectedValue(new Error("Database error"));

            await getRestaurants(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: expect.any(Error)
            });
        });  */
    });

    describe("createReservation", () => {
        beforeEach(() => {
            req = {
                params: { userId: "userId123" },
                body: {
                    restaurantId: "restaurant123",
                    date: "2024-12-12",
                    timeSlot: "7:00 PM",
                    tableSize: 4,
                    customerName: "John Doe",
                    customerPhone: "1234567890",
                    customerEmail: "johndoe@example.com"
                }
            };
        });

        test("should create reservation and return 201 if user exists", async () => {
            UserModel.findByIdAndUpdate.mockResolvedValue({
                reservations: [req.body]
            });

            await createReservation(req, res);

            expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
                "userId123",
                { $push: { reservations: expect.any(Object) } },
                { new: true }
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Reservation created successfully',
                reservation: expect.any(Object)
            });
        });

       /* test("should return 404 if user is not found", async () => {
            UserModel.findByIdAndUpdate.mockResolvedValue(null);

            await createReservation(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });

        test("should return 500 if there is a server error", async () => {
            UserModel.findByIdAndUpdate.mockRejectedValue(new Error("Database error"));

            await createReservation(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create reservation' });
        }); */
    });

    describe("deleteReservation", () => {
        beforeEach(() => {
            req = {
                query: {
                    userId: "userId123",
                    reservationId: "reservation123"
                }
            };
        });

        test("should delete reservation and return 200 if user and reservation exist", async () => {
            UserModel.findByIdAndUpdate.mockResolvedValue({
                reservations: []
            });

            await deleteReservation(req, res);

            expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
                "userId123",
                { $pull: { reservations: { _id: "reservation123" } } },
                { new: true }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Reservation deleted successfully',
                reservations: []
            });
        });

        test("should return 404 if user or reservation is not found", async () => {
            UserModel.findByIdAndUpdate.mockResolvedValue(null);

            await deleteReservation(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User or Reservation not found' });
        });

       /* test("should return 500 if there is a server error", async () => {
            UserModel.findByIdAndUpdate.mockRejectedValue(new Error("Database error"));

            await deleteReservation(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete reservation' });
        }); */
    });
});


describe("addReview", () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { restaurantId: "restaurant123" },
            body: {
                user: "user123",
                rating: 5,
                comment: "Great place!"
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should add review and return 201 if restaurant exists", async () => {
        const mockRestaurant = {
            _id: "restaurant123",
            reviews: [],
            save: jest.fn().mockResolvedValue()
        };

        RestaurantModel.findById.mockResolvedValue(mockRestaurant);

        await addReview(req, res);

        expect(RestaurantModel.findById).toHaveBeenCalledWith("restaurant123");
        expect(mockRestaurant.reviews).toContainEqual({
            user: "user123",
            rating: 5,
            comment: "Great place!"
        });
        expect(mockRestaurant.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: "Review added successfully",
            review: { user: "user123", rating: 5, comment: "Great place!" }
        });
    });

    test("should return 404 if restaurant is not found", async () => {
        RestaurantModel.findById.mockResolvedValue(null);

        await addReview(req, res);

        expect(RestaurantModel.findById).toHaveBeenCalledWith("restaurant123");
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "Restaurant not found"
        });
    });

});