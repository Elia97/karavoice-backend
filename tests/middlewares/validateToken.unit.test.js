const { validateToken } = require("../../middlewares/authMiddleware");
const jwt = require("jsonwebtoken");

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

describe("validateToken", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: "Bearer Token",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  it("Passa se il token è valido", async () => {
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, { id: 1, role: "user" });
    });

    await validateToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "Token",
      process.env.JWT_SECRET,
      expect.any(Function)
    );

    expect(req.user).toEqual({ id: 1, role: "user" });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("Fallisce se il token non è valido", async () => {
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error("Invalid token"), null);
    });
    await validateToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "Token",
      process.env.JWT_SECRET,
      expect.any(Function)
    );

    expect(req.user).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token non valido",
    });
  });

  it("Fallisce se il token è scaduto", async () => {
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback({ name: "TokenExpiredError" }, null);
    });

    await validateToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "Token",
      process.env.JWT_SECRET,
      expect.any(Function)
    );

    expect(req.user).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token scaduto",
    });
  });
});
