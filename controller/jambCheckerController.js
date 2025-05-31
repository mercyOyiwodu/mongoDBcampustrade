// // const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// const fs = require('fs');

// puppeteer.use(StealthPlugin());

// exports.checkJamb = async (req, res) => {
//   const { regnum, examyear } = req.body;

//   try {
//     const browser = await puppeteer.launch({
//       headless: true, // set to false if you want to debug visually
//       args: ['--no-sandbox', '--disable-setuid-sandbox'],
//       defaultViewport: null,
//       timeout: 0,
//     });

//     const page = await browser.newPage();

//     await page.goto('https://efacility.jamb.gov.ng/checkmatriculationlist', {
//       waitUntil: 'networkidle2', // waits for JS & network to settle
//       timeout: 90000,
//     });

//     // Optional: save page for debugging
//     const content = await page.content();
//     fs.writeFileSync('page.html', content);

//     // Wait for the dropdown and registration number input to load
//     await page.waitForSelector('select[name="ddlExamination"]', { timeout: 30000 });
//     await page.waitForSelector('input[name="txtRegNumber"]', { timeout: 30000 });

//     // Select the correct exam year option
//     const examValue = await getExamYearValue(examyear); // A function to map year to option value
//     await page.select('select[name="ddlExamination"]', examValue); // Selecting based on the value

//     // Type the registration number
//     await page.type('input[name="txtRegNumber"]', regnum);

//     // Click the search button and wait for navigation or response
//     await Promise.all([
//       page.click('#lnkSearch'), // Click the button
//       page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }), // Wait for page to load after click
//     ]);

//     // Wait for the result (success or error message) to appear
//     const resultText = await page.evaluate(() => {
//       const resultElement = document.querySelector('.alert-success') || document.querySelector('.alert-danger');
//       return resultElement ? resultElement.innerText.trim() : 'No result found';
//     });

//     await browser.close();

//     // Send the result to the client
//     res.json({ success: true, message: resultText });

//   } catch (error) {
//     console.error('Error checking JAMB status:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error checking JAMB status',
//       error: error.message,
//     });
//   }
// };

// // Function to map the exam year to the correct value in the dropdown
// const getExamYearValue = (year) => {
//   const yearMapping = {
//     '2024': '36',
//     '2023': '35',
//     '2022': '34',
//     '2021': '33',
//     '2020': '32',
//     '2019': '31',
//     '2018': '30',
//     '2017': '20',
//     '2016': '19',
//     '2015': '17',
//     '2014': '16',
//     '2013': '15',
//     '2012': '9',
//     '2011': '8',
//     '2010': '3',
//     '2009': '1',
//     '2008': '4',
//     '2007': '6',
//     '2006': '7',
//     '2005': '13',
//     '2004': '14',
//     '2003': '37',
//     '2002': '21',
//     '2001': '22',
//     '2000': '23',
//     '1999': '24',
//     '1998': '25',
//     '1996': '27',
//     '1995': '28',
//   };
  
//   // Return the corresponding value for the provided year
//   return yearMapping[year] || '0'; // Default to '0' if no match found
// };
