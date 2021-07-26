require("dotenv").config();

const { createZeaCloudClient } = require("@zeainc/zea-cloud-sdk-nodejs");
const open = require("open");

const fs = require("fs");
const fetch = require("node-fetch");

const downloadFile = async (url, path) => {
  const res = await fetch(url);
  const fileStream = fs.createWriteStream(path);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
};

(async () => {
  // Create the Zea Cloud client.
  // More info in the "Getting Started" section of the README.md file.
  const zeaCloudClient = await createZeaCloudClient({
    clientId: process.env.ZEA_CLOUD_CLIENT_ID,
    clientSecret: process.env.ZEA_CLOUD_CLIENT_SECRET,
    environmentTag: "staging",
  });

  // Create organization.
  const organization = await zeaCloudClient.addOrganization(
    "Some Inc.",
    "billing@someinc.com"
  );
  console.info("Organization id:", organization.getId());

  // Create project.
  const project = await organization.addProject("Some Project");

  // the project contains a version history, so ensure we have the latest version.
  await project.fetchLatestVersion();

  // Retrieve the project ID for the new project.
  const projectId = project.getId();
  console.info("Project id:", projectId);

  // The project has a root folder that can contain files or subfolders.
  // In this example,  we will simply upload files to the root folder.
  const folder = project.getRootFolder();

  // Upload files.
  folder.on("file-upload-progress", (payload) => {
    console.info(payload);
  });

  folder.on("file-upload-completed", (payload) => {
    console.info(payload);
  });

  folder.on("file-process-progress", (payload) => {
    console.info(payload);
  });

  folder.on("file-process-completed", async (payload) => {
    console.info(payload);

    // Fetch file.
    const project2 = await organization.findProject(projectId);
    await project2.fetchLatestVersion();
    const folder = project2.getRootFolder();
    const file = folder.getFileByName("HC_SRO4.step");

    // Will become getDownstreamSignedUrl('zcad')
    const signedUrl = await file.getSignedUrlToReadDownstream(
      "cad",
      "output.zcad"
    );
    console.info("Signed URL for reading:", signedUrl);

    zeaCloudClient.disconnectWebSocket();

    // Opens the cad-viewer to display the zcad file
    open(
      `https://cad-viewer-staging.zea.live/?embedded&zcad=${encodeURIComponent(
        signedUrl
      )}`
    );

    // or use the signed url to download the zcad file to your system.
    downloadFile(signedUrl, __dirname + "/HC_SRO4.zcad");
  });

  // A .zcadconfig file is used to configure the processing of source cad files into zcad files.
  await folder.addFileFromPath("./data/.zcadconfig");

  // Upload a CAD file for processing. This file will be processed using the settings specified in the .zcadconfig file.
  await folder.addFileFromPath("./data/HC_SRO4.step");
})();
