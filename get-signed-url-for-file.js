const { createZeaCloudClient } = require("@zeainc/zea-cloud-sdk-nodejs");
const open = require("open");

(async () => {
  const zeaCloudClient = await createZeaCloudClient({
    clientId: "<<CLIENT-ID>>",
    clientSecret: "<<CLIENT-SECRET>>",
    environmentTag: "staging",
  });

  // Fetch organization.
  const organizationId = "<<ORG-ID>>";
  const organization = await zeaCloudClient.findOrganization(organizationId);
  console.info("Organization name:", organization.getName());

  // Fetch project.
  const projectId = "<<PROJECT-ID>>";
  const project = await organization.findProject(projectId);
  await project.fetchLatestVersion();
  console.info("Project name:", project.getName());

  // Fetch file.
  const folder = project.getRootFolder();
  const file = folder.getFileByName("Dead_eye_bearingSTEP.stp");

  // Will become getDownstreamSignedUrl('zcad')
  const signedUrl = await file.getSignedUrlToReadDownstream(
    "cad",
    "output.zcad"
  );
  console.info("Signed URL for reading:", signedUrl);

  zeaCloudClient.disconnectWebSocket();

  // Opens the cad-viewer to display the zcad file
  await open(
    `https://cad-viewer-staging.zea.live/?embedded=&zcad=${encodeURIComponent(
      signedUrl
    )}`
  );
})();
