import type { Request, Response } from "express";
import { jest } from "@jest/globals";

type AuthHandlersModule = typeof import("../authHandler.js");

type RefreshRecord = {
  userId: string;
  revokedAt: Date | null;
  expiresAt: number;
};

type UserRecord = {
  id: string;
  name: string;
  username: string;
  password: string;
};

type NewUserRecord = {
  name: string;
  username: string;
  password: string;
};

const REQUIRED_ENV = {
  TURSO_DATABASE_URL: "libsql://example",
  TURSO_AUTH_TOKEN: "test-token",
  ACCESS_TOKEN_SECRET: "test-access-secret",
  REFRESH_TOKEN_SECRET: "test-refresh-secret",
  JWT_ISSUER: "meal-planner",
  NODE_ENV: "test",
  PORT: "4000",
};

const mockCreateUser = jest.fn<(user: NewUserRecord) => Promise<UserRecord>>();
const mockGetUserByUsername = jest.fn<(username: string) => Promise<UserRecord | undefined>>();
const mockSaveRefreshToken = jest.fn<(token: string, userId: string) => Promise<void>>();
const mockGetRefreshToken = jest.fn<(token: string) => Promise<RefreshRecord | null>>();
const mockRevokeRefreshToken = jest.fn<(token: string) => Promise<void>>();
const mockGenerateAccessToken = jest.fn<(userId: string, secret: string) => string>();
const mockGenerateRefreshToken = jest.fn<() => string>();
const mockGetBearerToken = jest.fn<(req: Request) => string>();

let handlers: AuthHandlersModule;

beforeAll(() => {
  Object.entries(REQUIRED_ENV).forEach(([key, value]) => {
    process.env[key] = value;
  });
});

beforeEach(async () => {
  jest.resetAllMocks();
  jest.resetModules();

  jest.unstable_mockModule("../../../db/queries/userQueries.js", () => ({
    createUser: mockCreateUser,
    getUserByUsername: mockGetUserByUsername,
    saveRefreshToken: mockSaveRefreshToken,
    getRefreshToken: mockGetRefreshToken,
    revokeRefreshToken: mockRevokeRefreshToken,
  }));

  jest.unstable_mockModule("../../../auth.js", () => ({
    generateAccessToken: mockGenerateAccessToken,
    generateRefreshToken: mockGenerateRefreshToken,
    getBearerToken: mockGetBearerToken,
  }));

  handlers = await import("../authHandler.js");
});

function createMockResponse() {
  const json = jest.fn();
  const cookie = jest.fn().mockReturnThis();
  const status = jest.fn().mockReturnThis();
  const res = {
    status,
    cookie,
    json,
  } as unknown as Response;
  return { res, status, cookie, json };
}

describe("signupHandler", () => {
  test("creates user when username free", async () => {
    const input: UserRecord = { id: "user-1", name: "Alice", username: "alice", password: "secret" };
    mockGetUserByUsername.mockResolvedValue(undefined);
    mockCreateUser.mockResolvedValue(input);

    const req = { body: input } as Request;
    const { res, status, json } = createMockResponse();

    await handlers.signupHandler(req, res);

    expect(mockGetUserByUsername).toHaveBeenCalledWith("alice");
    expect(mockCreateUser).toHaveBeenCalledWith({
      username: "alice",
      name: "Alice",
      password: "secret",
    });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(input);
  });

  test("responds 401 when username missing", async () => {
    const req = { body: { name: "Alice", password: "secret" } } as Request;
    const { res, status, json } = createMockResponse();

    await handlers.signupHandler(req, res);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: "Error: Missing user username/name/password" });
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  test("responds 401 when username already exists", async () => {
    const existing: UserRecord = { id: "user-1", name: "Alice", username: "alice", password: "secret" };
    mockGetUserByUsername.mockResolvedValue(existing);

    const req = { body: existing } as Request;
    const { res, status, json } = createMockResponse();

    await handlers.signupHandler(req, res);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: "Error: Username already exists" });
    expect(mockCreateUser).not.toHaveBeenCalled();
  });
});

describe("loginHandler", () => {
  test("returns tokens when credentials valid", async () => {
  const user: UserRecord = { id: "user-1", name: "Alice", username: "alice", password: "secret" };
    mockGetUserByUsername.mockResolvedValue(user);
    mockGenerateAccessToken.mockReturnValue("access-token");
    mockGenerateRefreshToken.mockReturnValue("refresh-token");

    const req = { body: { username: "alice", password: "secret" } } as Request;
    const { res, status, json, cookie } = createMockResponse();

    await handlers.loginHandler(req, res);

    expect(mockSaveRefreshToken).toHaveBeenCalledWith("refresh-token", "user-1");
    expect(cookie).toHaveBeenCalledWith(
      "refreshToken",
      "refresh-token",
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: "strict",
      }),
    );
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      userID: "user-1",
      username: "alice",
      name: "Alice",
      accessToken: "access-token",
    });
  });

  test("throws when username missing", async () => {
    const req = { body: { password: "secret" } } as Request;
    const { res } = createMockResponse();

    await expect(handlers.loginHandler(req, res)).rejects.toThrow("Missing user username/password");
  });

  test("throws when user not found", async () => {
    mockGetUserByUsername.mockResolvedValue(undefined);
    const req = { body: { username: "alice", password: "secret" } } as Request;
    const { res } = createMockResponse();

    await expect(handlers.loginHandler(req, res)).rejects.toThrow("Username does not exist");
  });

  test("throws when password invalid", async () => {
  const user: UserRecord = { id: "user-1", name: "Alice", username: "alice", password: "secret" };
    mockGetUserByUsername.mockResolvedValue(user);
    const req = { body: { username: "alice", password: "wrong" } } as Request;
    const { res } = createMockResponse();

    await expect(handlers.loginHandler(req, res)).rejects.toThrow("Password is incorrect");
  });
});

describe("refreshHandler", () => {
  test("responds 401 when refresh token missing", async () => {
    const req = { cookies: {} } as Request;
    const { res, status, json } = createMockResponse();

    await handlers.refreshHandler(req, res);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(mockGetRefreshToken).not.toHaveBeenCalled();
  });

  test("responds 401 when refresh token not found", async () => {
    const req = { cookies: { refreshToken: "refresh-token" } } as unknown as Request;
    mockGetRefreshToken.mockResolvedValue(null);

    const { res, status, json } = createMockResponse();

    await handlers.refreshHandler(req, res);

    expect(mockGetRefreshToken).toHaveBeenCalledWith("refresh-token");
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: "Invalid refresh token" });
  });

  test("responds 401 when token already revoked", async () => {
    const stored: RefreshRecord = {
      userId: "user-1",
      revokedAt: new Date(),
      expiresAt: Date.now() + 10_000,
    };

    mockGetRefreshToken.mockResolvedValue(stored);
  const req = { cookies: { refreshToken: "refresh-token" } } as unknown as Request;
    const { res, status, json } = createMockResponse();

    await handlers.refreshHandler(req, res);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: "Invalid refresh token" });
    expect(mockRevokeRefreshToken).not.toHaveBeenCalled();
  });

  test("revokes expired tokens and responds 401", async () => {
    const stored: RefreshRecord = {
      userId: "user-1",
      revokedAt: null,
      expiresAt: Date.now() - 1,
    };

    mockGetRefreshToken.mockResolvedValue(stored);
  const req = { cookies: { refreshToken: "refresh-token" } } as unknown as Request;
    const { res, status, json } = createMockResponse();

    await handlers.refreshHandler(req, res);

    expect(mockRevokeRefreshToken).toHaveBeenCalledWith("refresh-token");
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: "Refresh token expired" });
  });

  test("returns new access token when refresh valid", async () => {
    const stored: RefreshRecord = {
      userId: "user-1",
      revokedAt: null,
      expiresAt: Date.now() + 60_000,
    };

    mockGetRefreshToken.mockResolvedValue(stored);
    mockGenerateAccessToken.mockReturnValue("new-access-token");

  const req = { cookies: { refreshToken: "refresh-token" } } as unknown as Request;
    const { res, status, json } = createMockResponse();

    await handlers.refreshHandler(req, res);

    expect(mockGenerateAccessToken).toHaveBeenCalledWith("user-1", REQUIRED_ENV.ACCESS_TOKEN_SECRET);
    expect(mockRevokeRefreshToken).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ accessToken: "new-access-token" });
  });

  test("treats tokens expiring at the current instant as valid", async () => {
    const now = Date.now();
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(now);

    const stored: RefreshRecord = {
      userId: "user-1",
      revokedAt: null,
      expiresAt: now,
    };

    mockGetRefreshToken.mockResolvedValue(stored);
    mockGenerateAccessToken.mockReturnValue("edge-access-token");

    const req = { cookies: { refreshToken: "refresh-token" } } as unknown as Request;
    const { res, status, json } = createMockResponse();

    await handlers.refreshHandler(req, res);

    expect(mockGenerateAccessToken).toHaveBeenCalledWith("user-1", REQUIRED_ENV.ACCESS_TOKEN_SECRET);
    expect(mockRevokeRefreshToken).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ accessToken: "edge-access-token" });

    nowSpy.mockRestore();
  });

  test("rejects tokens flagged as revoked even when not expired", async () => {
    const stored: RefreshRecord = {
      userId: "user-1",
      revokedAt: new Date(),
      expiresAt: Date.now() + 60_000,
    };

    mockGetRefreshToken.mockResolvedValue(stored);

    const req = { cookies: { refreshToken: "refresh-token" } } as unknown as Request;
    const { res, status, json } = createMockResponse();

    await handlers.refreshHandler(req, res);

    expect(mockGenerateAccessToken).not.toHaveBeenCalled();
    expect(mockRevokeRefreshToken).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: "Invalid refresh token" });
  });
});
