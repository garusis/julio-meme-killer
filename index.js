import puppeteer from "puppeteer";
import AWS from "aws-sdk";
import fs from "fs";

import dotenv from "dotenv";
dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

const rekognition = new AWS.Rekognition();

const CHAT_TITLE = "Cúcuta Dev Mame";
//const CHAT_TITLE = "Yo";
const sourceImage = fs.readFileSync("reference.jpg");

/**
 *
 * @param {Buffer} buffer
 */
function isJPEG(buffer) {
  return (
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[buffer.length - 2] === 0xff &&
    buffer[buffer.length - 1] === 0xd9
  );
}

/**
 *
 * @param {puppeteer.Page} page
 * @param {{ base64Image: string, nodeId: string }} imageInfo
 */
async function deleteMessage(page, imageInfo) {
  await page.hover(`[data-juliokillerid='${imageInfo.nodeId}']`);
  await page.click(
    `[data-juliokillerid='${imageInfo.nodeId}'] + span [role=button]`
  );
  await page.click("[role=button][aria-label=Eliminar]");
  await page.click("[data-testid='popup-controls-delete']");
  console.log("Image deleted");
}

/**
 *
 * @param {puppeteer.Page} page
 * @param {{ base64Image: string, nodeId: string }} imageInfo
 */
async function processImage(page, imageInfo) {
  const buffer = Buffer.from(imageInfo.base64Image, "base64");

  if (!isJPEG(buffer)) return;
  console.log("Image found");

  try {
    const results = await rekognition
      .compareFaces({
        SourceImage: {
          Bytes: sourceImage,
        },
        TargetImage: {
          Bytes: buffer,
        },
        SimilarityThreshold: 70,
      })
      .promise();

    if (results.FaceMatches.some((face) => face.Similarity > 50)) {
      console.log("Image matches");
      await deleteMessage(page, imageInfo);
    }
  } catch (e) {
    console.log("Fails");
    console.log(imageInfo.nodeId);
    console.error(e);
  }
}

async function run() {
  const browser = await puppeteer.launch({
    headless: "new",
    userDataDir: "./user_data",
  });
  const page = await browser.newPage();
  await page.goto("https://web.whatsapp.com");

  await page.waitForSelector(`[title='${CHAT_TITLE}']`);
  console.log("Chat is ready");

  page.on("console", async (msg) => {
    if (msg.type() !== "log") return;
    try {
      const imageInfo = await msg.args()[0].jsonValue();
      if (!imageInfo.base64Image) return;
      void processImage(page, imageInfo); // I don't want to wait for this promise
    } catch (err) {
      console.log(err);
    }
  });

  await page.evaluate(() => {
    const generateUUID = () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          var r = (Math.random() * 16) | 0,
            v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    };

    const extractImg = async (img, parentNode) => {
      const imageUrl = img.src;
      const response = await fetch(imageUrl);
      const data = await response.arrayBuffer();
      const base64Image = btoa(
        new Uint8Array(data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      console.log({
        base64Image,
        nodeId: parentNode.getAttribute("data-juliokillerid"),
      });
    };

    const observer = new MutationObserver((mutationList) => {
      mutationList.forEach((mutation) => {
        if (mutation.type !== "childList") return;

        Array.from(mutation.addedNodes).forEach((node) => {
          const imgs = node.querySelectorAll("IMG");
          if (!imgs.length) return;

          const parentNode = node.parentElement.parentElement.parentElement;
          let id = parentNode.getAttribute("data-juliokillerid");
          if (!id) {
            id = generateUUID();
            parentNode.setAttribute("data-juliokillerid", id);
          }

          imgs.forEach((img) => extractImg(img, parentNode));
        });
      });
    });

    observer.observe(document, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  });

  await page.click(`[title='${CHAT_TITLE}']`);
}

run();
