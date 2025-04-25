const { validateRegister } = require("../../middlewares/authMiddleware");
const User = require("../../models/User");

const runMiddleware = async (middlewares, req, res, next) => {
  for (const middleware of middlewares) {
    await middleware(req, res, next);
  }
};

jest.mock("../../models/User", () => ({
  findByEmail: jest.fn(),
}));

describe("validateRegister", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        name: "test",
        email: "test@example.com",
        role: "user",
        password: "123456",
        passwordConfirmation: "123456",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
    User.findByEmail.mockResolvedValue(null);
  });

  it("Passa se tutti i campi sono validi", async () => {
    await runMiddleware(validateRegister, req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("Fallisce se il nome è mancante", async () => {
    req.body.name = "";
    await runMiddleware(validateRegister, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: "Il nome è obbligatorio",
    });
  });

  it("Fallisce se il nome è troppo corto", async () => {
    req.body.name = "t";
    await runMiddleware(validateRegister, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: "Il nome deve avere almeno 2 caratteri",
    });
  });

  it("Fallisce se l'email non è valida", async () => {
    req.body.email = "invalid-email";
    await runMiddleware(validateRegister, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: "Email non valida",
    });
  });

  it("Fallisce se l'email è già registrata", async () => {
    User.findByEmail.mockResolvedValue({ email: "test@example.com" });
    await runMiddleware(validateRegister, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: "Email già registrata",
    });
  });

  it("Fallisce se il ruolo non è valido", async () => {
    req.body.role = "invalid-role";
    await runMiddleware(validateRegister, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: "Il ruolo deve essere 'user' o 'admin'",
    });
  });

  it("Passa se il ruolo è mancante", async () => {
    req.body.role = undefined;
    await runMiddleware(validateRegister, req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalledWith();
  });

  it("Fallisce se la password è troppo corta", async () => {
    req.body.password = "12345";
    await runMiddleware(validateRegister, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: "La password deve avere almeno 6 caratteri",
    });
  });

  it("Fallisce se le password non corrispondono", async () => {
    req.body.passwordConfirmation = "654321";
    await runMiddleware(validateRegister, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: "Le password non corrispondono",
    });
  });
});
