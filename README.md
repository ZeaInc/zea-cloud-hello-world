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

3. Locate your Zea Cloud's client id and secret. You can find these values in the Zea Cloud console, or you can contact support@zea.live

The zea cloud console can be found here:

https://cloud-staging.zea.live/

4. Copy the `.env.example` file located at the root of this project, into a new `.env` file:

```bash
cp .env.example .env
```
 
5. Edit the newly created `.env` file and paste there your Zea Cloud's client id and secret. 

> The .env file should not be comitted to version control. It is your responsibility to ensure that your Client Secret is not divulged to anyone outside of your organization. These 'secret' values can be managed using tools such as 'GitHub Secrets'.

https://docs.github.com/en/actions/reference/encrypted-secrets


6. invoke the provided scripts in your console using node.

e.g. 
```
node convert-and-display.js
```
