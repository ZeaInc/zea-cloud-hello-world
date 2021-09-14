/* eslint-disable require-jsdoc */
require("dotenv").config();

const { createZeaCloudClient } = require("@zeainc/zea-cloud-sdk-nodejs");

const fs = require("fs");
path = require("path");

const cadFileExts = new RegExp(
  "\\.(stp|step|jt|3dm|ifc|catpart|sldprt|sldasm|xcgm|rvt|rfa|3dxml|cgr|igs|sab|3dm)$",
  "i"
);

function writeTOC(results, output) {
  fs.writeFile(output, JSON.stringify(results, null, 2), function (err) {
    if (err) return console.log(err);
  });
}

async function processFolder(dir, output) {
  // Environment variables.
  const {
    ZEA_CLOUD_ORGANIZATION_ID,
    ZEA_CLOUD_ORGANIZATION_SECRET,
    ZEA_CLOUD_PROJECT_ID,
  } = process.env;

  // Create the Zea Cloud client.
  // More info in the "Getting Started" section of the README.md file.
  const zeaCloudClient = await createZeaCloudClient({
    organizationId: ZEA_CLOUD_ORGANIZATION_ID,
    organizationSecret: ZEA_CLOUD_ORGANIZATION_SECRET,
    environmentTag: "staging",
  });

  // Retrieve the project ID for the new project.
  console.log("processFolder", dir);

  const project = await zeaCloudClient.fetchProject(ZEA_CLOUD_PROJECT_ID);

  const toc = {};

  // The project has a root folder that can contain files or subfolders.
  // In this example,  we will simply upload files to the root folder.
  const folder = project.getRootFolder();

  let processing = {};
  let totalFiles = 0;
  let completedFiles = 0;

  folder.on("file-process-completed", (payload) => {
    completedFiles += 1;

    const filename = payload.jobData.filename;
    const promise = processing[filename];

    if (!promise) {
      return;
    }

    delete processing[filename];

    console.log(
      `File succeeded (${completedFiles} of ${totalFiles}):`,
      filename
    );

    const url = `https://storage.googleapis.com/zea-cloud-downstream-staging/${ZEA_CLOUD_ORGANIZATION_ID}/${ZEA_CLOUD_PROJECT_ID}/${payload.jobData.id}/cad/output.zcad`;

    toc[filename] = url;
    writeTOC(toc, output);

    if (Object.values(processing).length == 0) {
      writeTOC(toc, output);
      zeaCloudClient.disconnectWebSocket();
    }
  });

  const files = fs.readdirSync(dir);
  let filePaths = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isFile()) {
      if (cadFileExts.test(filepath)) {
        toc[file] = "pending";
        filePaths.push(filepath);
        processing[file] = true;
      }
    }
  }

  totalFiles = filePaths.length;

  project.processFiles(filePaths);
}

// ////////////////////////////////
// Entry

if (process.argv[1] == __filename) {
  console.log(process.argv.length);
  if (process.argv.length == 3) {
    const srcFolderPath = path.resolve(path.normalize(process.argv[2]));
    const output = path.normalize(path.join(srcFolderPath, `toc.json`));
    processFolder(srcFolderPath, output);
  } else if (process.argv.length == 4) {
    const srcFolderPath = path.resolve(path.normalize(process.argv[2]));
    const output = path.resolve(path.normalize(process.argv[3]));
    processFolder(srcFolderPath, output);
  }
}

module.exports.processFolder = processFolder;
