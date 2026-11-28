import { describe, test, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { clearDatabase, createUser, closeDatabase } from "./helpers.js";

describe("workspace permissions", () => {
  let owner;
  let member;
  let stranger;
  let workspaceId;

  beforeEach(async () => {
    await clearDatabase();

    owner = await createUser({ name: "Owner", email: "owner@test.com" });
    member = await createUser({ name: "Member", email: "member@test.com" });
    stranger = await createUser({ name: "Stranger", email: "stranger@test.com" });

    const createResponse = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ name: "Team Workspace" });

    workspaceId = createResponse.body.data.workspace.id;

    await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ email: "member@test.com", role: "member" });
  });

  afterAll(async () => {
    await closeDatabase();
  });

  test("rejects a request without a login token", async () => {
    const response = await request(app).get(`/api/workspaces/${workspaceId}`);

    expect(response.status).toBe(401);
  });

  test("a stranger cannot open the workspace", async () => {
    const response = await request(app)
      .get(`/api/workspaces/${workspaceId}`)
      .set("Authorization", `Bearer ${stranger.token}`);

    expect(response.status).toBe(404);
  });

  test("a stranger does not see the workspace in their list", async () => {
    const response = await request(app)
      .get("/api/workspaces")
      .set("Authorization", `Bearer ${stranger.token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.workspaces).toHaveLength(0);
  });

  test("a member can open the workspace", async () => {
    const response = await request(app)
      .get(`/api/workspaces/${workspaceId}`)
      .set("Authorization", `Bearer ${member.token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.workspace.name).toBe("Team Workspace");
  });

  test("a member cannot add other members", async () => {
    const response = await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${member.token}`)
      .send({ email: "stranger@test.com" });

    expect(response.status).toBe(403);
  });

  test("the owner can add a member, who can then open the workspace", async () => {
    const addResponse = await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ email: "stranger@test.com" });

    expect(addResponse.status).toBe(201);

    const openResponse = await request(app)
      .get(`/api/workspaces/${workspaceId}`)
      .set("Authorization", `Bearer ${stranger.token}`);

    expect(openResponse.status).toBe(200);
  });
});
