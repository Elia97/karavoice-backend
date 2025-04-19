const { validateLogin } = require("../../middlewares/authMiddleware");

const runMiddleware = async (middlewares, req, res, next) => {
  for (const middleware of middlewares) {
    await middleware(req, res, next);
  }
};

describe("validateLogin", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  it("Passa se tutti i campi sono validi", async () => {
    await runMiddleware(validateLogin, req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("Fallisce se l'email è mancante", async () => {
    req.body.email = "";
    await runMiddleware(validateLogin, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: "L'email è obbligatoria",
    });
  });

  it("Fallisce se l'email non è valida", async () => {
    req.body.email = "invalid-email";
    await runMiddleware(validateLogin, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: "Email non valida",
    });
  });

  it("Fallisce se la password è mancante", async () => {
    req.body.password = "";
    await runMiddleware(validateLogin, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: "La password è obbligatoria",
    });
  });
});
