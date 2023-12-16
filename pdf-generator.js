const puppeteer = require("puppeteer");
const fs = require("fs").promises;

let browser;

async function getBrowserInstance() {
  if (!browser) {
    browser = await puppeteer.launch({
      args: [
        "--disable-extensions",
        "--disable-dev-shm-usage",
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });
  }
  return browser;
}

async function readContent(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (err) {
    console.error(`Error reading file from disk: ${err}`);
    return "";
  }
}

async function generatePDF(htmlContent, cssContent) {
  const browser = await getBrowserInstance();
  const page = await browser.newPage();

  // Set request interception to avoid loading unnecessary resources
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    console.log(request.resourceType());
    if (["stylesheet", "image"].includes(request.resourceType())) {
      request.continue();
    } else {
      request.abort();
    }
  });

  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  // Inject CSS
  await page.addStyleTag({ content: cssContent });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await page.close();
  return pdf;
}
async function generatePDFFromHTML(htmlFilePath, cssFilePath) {
  const htmlContent = await readContent(htmlFilePath);
  const cssContent = await readContent(cssFilePath);
  const pdf = await generatePDF(htmlContent, cssContent);
  return pdf;
}

// Example usage
const htmlFilePath = "./template.html";
const cssFilePath = "./template.css";

generatePDFFromHTML(htmlFilePath, cssFilePath).then((pdf) => {
  require("fs").writeFileSync("output.pdf", pdf);
});

module.exports = generatePDFFromHTML;
