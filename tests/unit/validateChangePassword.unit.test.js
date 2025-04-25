const { validateChangePassword } = require("../../middlewares/authMiddleware");

const runMiddleware = async (middlewares, req, res, next) => {
  for (const middleware of middlewares) {
    await middleware(req, res, next);
  }
};

describe("validateChangePassword", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        email: "test@example.com",
        oldPassword: "oldPassword",
        newPassword: "newPassword",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  it("Passa se tutti i campi sono validi", async () => {
    await runMiddleware(validateChangePassword, req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();

    expect(req.body.newPassword).toBeDefined();
    expect(req.body.oldPassword).toBeDefined();
    expect(req.body.email).toBeDefined();
  });

  it("Fallisce se l'email non è valida", async () => {
    req.body.email = "invalid-email";
    await runMiddleware(validateChangePassword, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: "Email non valida",
    });
  });

  it("Fallisce se la password attuale è mancante", async () => {
    req.body.oldPassword = "";
    await runMiddleware(validateChangePassword, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: "La password attuale è obbligatoria",
    });
  });

  it("Fallisce se la nuova password è mancante", async () => {
    req.body.newPassword = "";
    await runMiddleware(validateChangePassword, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: "La nuova password è obbligatoria",
    });
  });

  it("Fallisce se la nuova password è troppo corta", async () => {
    req.body.newPassword = "12345";
    await runMiddleware(validateChangePassword, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: "La nuova password deve avere almeno 6 caratteri",
    });
  });
});
