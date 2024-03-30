// Importing required modules
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

// Define the base URL for the ArXiv API
const ARXIV_API_BASE_URL = 'http://export.arxiv.org/api';

async function downloader(domain, outputPath, updateWidgetContent, maxResults = 10) {
    try {
        // Make a GET request to the ArXiv API endpoint
        const response = await axios.get(`${ARXIV_API_BASE_URL}/query?search_query=all:${domain}&max_results=${maxResults}`);

        // Parse the XML response
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(response.data);

        // Ensure the output directory exists
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }

        // Check if response contains any entries
        if (result.feed && result.feed.entry) {
            const entries = Array.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry];

            // Loop through the entries and download each paper
            for (const entry of entries) {
                const title = entry.title[0];
                const pdfLink = entry.link.find(link => link.$.title === 'pdf');
                if (pdfLink) {
                    const paperUrl = pdfLink.$.href;
                    const paperFileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
                    const paperPath = path.join(outputPath, paperFileName);

                    // Download the paper and save it to the specified path
                    const paperResponse = await axios({
                        method: 'GET',
                        url: paperUrl,
                        responseType: 'stream'
                    });

                    // Create a write stream to save the paper
                    const writer = fs.createWriteStream(paperPath);
                    paperResponse.data.pipe(writer);

                    // Wait for the download to finish
                    await new Promise((resolve, reject) => {
                        writer.on('finish', resolve);
                        writer.on('error', reject);
                    });

                    // Update widget content to indicate download progress
                    updateWidgetContent(`Downloaded: ${title}`);
                } else {
                    console.error(`PDF link not found for paper: ${title}`);
                }
            }

            // Update widget content to indicate downloads completed
            updateWidgetContent('Download completed successfully.');
        } else {
            console.error('No papers found in the API response.');
        }
    } catch (error) {
        console.error('Error downloading papers:', error.response ? error.response.data : error.message);
    }
}



module.exports = {
    downloader
};
