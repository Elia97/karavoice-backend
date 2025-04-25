const request = require("supertest");
const app = require("../../index.js"); // il tuo express app
const { User } = require("../../models/index.js");

describe("REGISTER - Integration Test", () => {
  it("Dovrebbe registrare un nuovo utente e salvarlo nel DB", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Test2",
      email: "test2@example.com",
      password: "secure123",
      passwordConfirmation: "secure123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty(
      "message",
      "Utente registrato con successo"
    );

    const user = await User.findOne({ where: { email: "test2@example.com" } });
    expect(user).not.toBeNull();
    expect(user.name).toBe("Test2");
  });
});
