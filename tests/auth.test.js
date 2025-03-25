const request = require("supertest");
const app = require("../index");
const { sequelize } = require("../models");

describe("Authentication Routes", () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should register a new user", async () => {
    const response = await request(app).post("/auth/register").send({
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.email).toBe("testuser@example.com");
  });

  it("should login with valid credentials", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "testuser@example.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
  });
});
