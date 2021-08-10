require("dotenv").config();

const fs = require("fs");
const path = require("path");
const request = require("superagent");

const {
  ZEA_CLOUD_API_HOST,
  ZEA_CLOUD_AUTH0_SUBDOMAIN,
  ZEA_CLOUD_ORGANIZATION_ID,
  ZEA_CLOUD_ORGANIZATION_SECRET,
} = process.env;

/**
 * Get auth token.
 */
const getToken = async () => {
  const authUrl = `https://${ZEA_CLOUD_AUTH0_SUBDOMAIN}.auth0.com/oauth/token`;

  try {
    const response = await request
      .post(authUrl)
      .type("form")
      .send({ audience: "cloud-api.zea.live" })
      .send({ client_id: ZEA_CLOUD_ORGANIZATION_ID })
      .send({ client_secret: ZEA_CLOUD_ORGANIZATION_SECRET })
      .send({ grant_type: "client_credentials" });

    const { body } = response;

    const token = body.access_token;

    return token;
  } catch (error) {
    console.error(
      `Error while trying to fetch auth token for client id "${ZEA_CLOUD_ORGANIZATION_ID}":`,
      error.response.res.text
    );
  }
};

/**
 * Send a post request to the API.
 */
const sendPostRequest = async (uri, token, data) => {
  const url = `${ZEA_CLOUD_API_HOST}/${uri}`;

  console.info("Sending POST request to:");
  console.info("Request URL:", url);
  console.info("Request body:", data);

  try {
    const response = await request
      .post(url)
      .auth(token, { type: "bearer" })
      .send(data);

    const { body } = response;

    console.info("Response body:", body);

    return body;
  } catch (error) {
    console.error("Error while sending post request:", error.response.res.text);
  }
};

(async () => {
  const token = await getToken();

  if (!token) {
    return;
  }

  // Create a project to add files to it later on.
  const newProjectData = { name: "Some Project" };
  const newProjectResponse = await sendPostRequest(
    `organizations/${ZEA_CLOUD_ORGANIZATION_ID}/projects`,
    token,
    newProjectData
  );
  const { id: projectId } = newProjectResponse;

  // Allocate space in the project for the new file.
  // Multiple files can be allocated at the same time.
  const filePath = "./data/HC_SRO4.step";
  const fileName = path.basename(filePath);

  const newAllocationData = [{ name: fileName, parentFolderId: null }];
  const newAllocationResponse = await sendPostRequest(
    `organizations/${ZEA_CLOUD_ORGANIZATION_ID}/projects/${projectId}/files`,
    token,
    newAllocationData
  );
  const { signedUrl } = newAllocationResponse[0];

  // Upload new file.
  const fileBuffer = fs.readFileSync(filePath);

  return request
    .put(signedUrl)
    .send(fileBuffer)
    .on("progress", (event) => {
      console.info("Upload progress event:", event);
    });
})();
