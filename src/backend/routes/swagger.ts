export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Digital Atelier API",
    version: "1.0.0",
    description: "API documentation for the Digital Atelier eCommerce and Generation backend.",
  },
  servers: [
    {
      url: "/api",
      description: "Local Server",
    },
  ],
  paths: {
    "/generate": {
      post: {
        summary: "Create a new generation job",
        tags: ["Generation"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  hub: { type: "string" },
                  mode: { type: "string" },
                  promptInputs: { type: "object" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Job created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    jobId: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/status": {
      get: {
        summary: "Check the status of a generation job",
        tags: ["Generation"],
        parameters: [
          {
            name: "jobId",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Job status",
          },
        },
      },
    },
    "/gallery": {
      get: {
        summary: "Fetch gallery items",
        tags: ["Gallery"],
        parameters: [
          {
            name: "type",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["images", "videos", "all"] },
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "number" },
          },
        ],
        responses: {
          "200": {
            description: "List of gallery items",
          },
        },
      },
    },
    "/approve": {
      post: {
        summary: "Approve a generation and trigger final rendering",
        tags: ["Generation"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  jobId: { type: "string" },
                  approvedImage: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Approval registered",
          },
        },
      },
    },
    "/upload": {
      post: {
        summary: "Upload a file",
        tags: ["Upload"],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "File uploaded successfully",
          },
        },
      },
    },
  },
};
