const express = require("express");
const fs = require("fs").promises;
const generatePDFFromHTML = require("./pdf-generator");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/generate-pdf", async (req, res) => {
  try {
    // const htmlContent = req.body.html; // HTML content from the request
    // if (!htmlContent) {
    //   return res.status(400).send("No HTML content provided");
    // }

    // Example usage
    const htmlFilePath = "./template.html";
    const cssFilePath = "./template.css";

    const pdf = await generatePDFFromHTML(htmlFilePath, cssFilePath).then(
      (pdf) => {
        require("fs").writeFileSync("output.pdf", pdf);
      }
    );

    // Send the PDF file in the response
    res.contentType("application/pdf");
    res.send(pdf);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

// async function generatePDF(htmlFilePath, cssFilePath) {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   const htmlContent = await readContent(htmlFilePath);
//   await page.setContent(htmlContent, { waitUntil: "networkidle0" });

//   const cssContent = await readContent(cssFilePath);
//   await page.addStyleTag({ content: cssContent });

//   const pdf = await page.pdf({ format: "A4", printBackground: true });

//   await browser.close();
//   return pdf;
// }

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
