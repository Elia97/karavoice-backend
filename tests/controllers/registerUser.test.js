const { registerUser } = require("../../controllers/authController");
const { mockRequest, mockResponse } = require("jest-mock-req-res");

jest.mock("../../models", () => ({
  User: {
    createEntry: jest.fn(),
    findByEmail: jest.fn(),
    updateLastLogin: jest.fn(),
  },
  Booking: {
    belongsTo: jest.fn(),
  },
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

describe("RegisterUser", () => {
  let req, res, next;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const User = require("../../models").User;

  it("Dovrebbe registrare un nuovo utente con successo", async () => {
    req.body = {
      name: "Test User",
      email: "testuser@example.com",
      password: "123456",
      passwordConfirmation: "123456",
    };

    User.createEntry.mockResolvedValue({
      id: 1,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: "user",
    });

    await registerUser(req, res, next);

    expect(User.createEntry).toHaveBeenCalledWith({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: "user",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Utente registrato con successo",
      user: {
        id: 1,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: "user",
      },
    });
  });
});
