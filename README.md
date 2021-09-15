# Zea Cloud "hello world"

This repository provides some basic examples of how to use the zea-cloud API to process files and load them into the zea-cad-viewer.

## Requirements

The samples in this repository utilize the Node.JS Zea Cloud SDK to interface with Zea Cloud.

## Getting Started

1. Clone this repository to a folder in your system.
2. In the root folder of the project, depending on which package manager you are using, please run either...

```bash
npm install
```

or

```bash
yarn
```

This will install the Zea Cloud SDK and any dependencies into the node_modules folder of the project.

3. Locate your Zea Cloud's organization id and secret. You can find these values in the Zea Cloud console, or you can contact support@zea.live

The zea cloud console can be found here:

https://cloud-staging.zea.live/

4. Copy the `.env.example` file located at the root of this project, into a new `.env` file:

```bash
cp .env.example .env
```

5. Edit the newly created `.env` file and paste there your Zea Cloud's organization id and secret.

![image](https://user-images.githubusercontent.com/840121/133453746-9b0516e3-5074-4963-8441-b4313a3cfa4f.png)

> You can find your Organization ID and Secret using the Cloud Dashboard. Please sign into https://cloud-staging.zea.live/ and navigate to 'Organization settings'

> The .env file should not be committed to version control. It is your responsibility to ensure that your Organization Secret is not divulged to anyone outside of your organization. These 'secret' values can be managed using tools such as 'GitHub Secrets'.

https://docs.github.com/en/actions/reference/encrypted-secrets

6. invoke the provided scripts in your console using node.

e.g.

```
node convert-and-display.js
```

The sample script will perform the following steps.

- Using the env vars, connects to an organization.
- Under that organization, it creates a new project called "Some Project"
- Upload the .zcadconfig file to configure the project.
- Upload one of the sample files to the project.
- The script listens to events from the cloud SDK to determine once the processing is finished.
- Once the file is processed, the script launches the Zea CAD Viewer providing it with the URL to the resulting zcad file.

![image](https://user-images.githubusercontent.com/840121/127028856-79c3adbe-ebb9-4c2c-82ec-8921c27fa7d3.png)
