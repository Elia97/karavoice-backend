const { validateTokenAdmin } = require("../../middlewares/authMiddleware");
const jwt = require("jsonwebtoken");

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

describe("validateTokenAdmin", () => {
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

  it("Passa se il token è valido e l'utente è admin", async () => {
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, { id: 1, role: "admin" });
    });

    await validateTokenAdmin(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "Token",
      process.env.JWT_SECRET,
      expect.any(Function)
    );

    expect(req.user).toEqual({ id: 1, role: "admin" });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("Fallisce se il token è valido ma l'utente non è admin", async () => {
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, { id: 1, role: "user" });
    });

    await validateTokenAdmin(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "Token",
      process.env.JWT_SECRET,
      expect.any(Function)
    );

    expect(req.user).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Accesso negato: permessi insufficienti",
    });
  });

  it("Fallisce se il token non è valido", async () => {
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error("Invalid token"), { id: 1, role: "admin" });
    });
    await validateTokenAdmin(req, res, next);

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
      callback({ name: "TokenExpiredError" }, { id: 1, role: "admin" });
    });

    await validateTokenAdmin(req, res, next);

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
