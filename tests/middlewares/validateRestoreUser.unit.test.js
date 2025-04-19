const { validateRestoreUser } = require("../../middlewares/authMiddleware");
const User = require("../../models/User");

const runMiddleware = async (middlewares, req, res, next) => {
  for (const middleware of middlewares) {
    await middleware(req, res, next);
  }
};

jest.mock("../../models/User", () => ({
  findByEmail: jest.fn(),
}));

describe("validateRestoreUser", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        email: "test@example.com",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
    User.findByEmail.mockResolvedValue(null);
  });

  it("Passa se l'email è valide e l'utente esiste", async () => {
    User.findByEmail.mockResolvedValue({ email: "test@example.com" });
    await runMiddleware(validateRestoreUser, req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("Fallisce se l'email è mancante", async () => {
    req.body.email = "";
    await runMiddleware(validateRestoreUser, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: "L'email è obbligatoria",
    });
  });

  it("Fallisce se l'email non è valida", async () => {
    req.body.email = "invalid-email";
    await runMiddleware(validateRestoreUser, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: "Email non valida",
    });
  });
});
