const { createZeaCloudClient } = require("@zeainc/zea-cloud-sdk-nodejs");

(async () => {
  const zeaCloudClient = await createZeaCloudClient({
    clientId: "<<CLIENT-ID>>",
    clientSecret: "<<CLIENT-SECRET>>",
    environmentTag: "staging",
  });

  // Create organization.
  const organization = await zeaCloudClient.addOrganization(
    "Foo Inc.",
    "billing@fooinc.com"
  );
  console.info("Organization id:", organization.getId());

  // Create project.
  const project = await organization.addProject("Foo Project");
  await project.fetchLatestVersion();
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

  // A .zcadconfig file is used to configure the processing of source cad files into zcad files.
  await folder.addFileFromPath("./data/.zcadconfig");
  await folder.addFileFromPath("./data/Fidget-Spinner-2.STEP");

  zeaCloudClient.disconnectWebSocket();
})();
