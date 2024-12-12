import { afterAll, beforeAll, describe, expect, it, jest } from "bun:test";
import { Elysia } from "elysia";

import authController from "@/api/auth/auth.controller";
import AuthService from "@/api/auth/auth.service";
import UserService from "@/api/users/user.service";

const mockUserService = {
  getUser: jest.fn(),
};

const mockAuthService = {
  signIn: jest.fn(),
  signUp: jest.fn(),
};

beforeAll(() => {
  UserService.getUser = mockUserService.getUser;
  AuthService.signIn = mockAuthService.signIn;
  AuthService.signUp = mockAuthService.signUp;
});

describe("Auth API", () => {
  let appInstance: Elysia;

  beforeAll(() => {
    appInstance = new Elysia().use(authController).listen(3001);
  });

  afterAll(() => {
    appInstance.stop();
  });

  it("should sign in an existing user", async () => {
    const mockUser = { id: "123", email: "test@example.com" };
    const mockToken = "mocked-token";

    mockUserService.getUser.mockResolvedValueOnce(mockUser);
    mockAuthService.signIn.mockResolvedValueOnce({
      user: mockUser,
      token: mockToken,
    });

    const res = await fetch("http://localhost:3001/auth/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "password" }),
    });

    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.user).toEqual(mockUser);
    expect(data.token).toBe(mockToken);
  });

  it("should sign up a new user", async () => {
    const mockNewUser = { id: "456", email: "new@example.com" };
    const mockToken = "new-mocked-token";

    mockUserService.getUser.mockResolvedValueOnce(null);
    mockAuthService.signUp.mockResolvedValueOnce({
      user: mockNewUser,
      token: mockToken,
    });

    const res = await fetch("http://localhost:3001/auth/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "new@example.com",
        password: "new-password",
      }),
    });

    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.user).toEqual(mockNewUser);
    expect(data.token).toBe(mockToken);
  });

  it("should set session cookies", async () => {
    const mockUser = { id: "123", email: "cookie@example.com" };
    const mockToken = "cookie-token";

    mockUserService.getUser.mockResolvedValueOnce(mockUser);
    mockAuthService.signIn.mockResolvedValueOnce({
      user: mockUser,
      token: mockToken,
    });

    const res = await fetch("http://localhost:3001/auth/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "cookie@example.com",
        password: "password",
      }),
    });

    const setCookieHeader = res.headers.get("set-cookie");

    expect(res.status).toBe(200);
    expect(setCookieHeader).toBeDefined();
    expect(setCookieHeader).toContain("session=");
  });
});
