#!/usr/bin/node

// Importing required modules
const blessed = require('blessed');
const contrib = require('blessed-contrib');
const figlet = require('figlet');
const { downloader } = require('./downloader');

// Function to start downloading papers
async function startDownload(domain, outputPath, updateWidgetContent, updateTodoList, updatePapersRead) {
    try {
        // Update widget content to indicate downloading has started
        updateWidgetContent('Downloading papers...');
        // Call the downloader function to start downloading papers
        const downloadedFiles = await downloader(domain, outputPath, updateWidgetContent);
        // Update widget content to indicate downloads completed
        updateWidgetContent('Downloads completed.');
        // Update to-do list with downloaded papers
        updateTodoList(downloadedFiles);
    } catch (error) {
        // Update widget content to indicate an error occurred
        updateWidgetContent(`Error downloading papers: ${error}`);
    }
}

// Initialize screen
const screen = blessed.screen();

// Generate ASCII art for the application logo
figlet('Catch Up', function(err, data) {
    if (err) {
        console.log('Error generating ASCII art:', err);
        return;
    }
    // Initialize grid layout after generating ASCII art
    const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

    // Logo Widget
    const logoBox = grid.set(0, 0, 3, 12, blessed.box, {
        content: data,
        style: { fg: 'green' }
    });

    // Papers Read Widget
    const papersReadBox = blessed.box({
        parent: screen,
        label: 'Papers Read',
        keys: true,
        vi: true,
        width: '50%',
        height: '70%',
        top: '20%',
        left: '0%',
        border: {
            type: 'line'
        },
        style: {
            fg: 'white',
            bg: 'magenta',
            border: {
                fg: '#f0f0f0'
            }
        }
    });

    // To-Do List Widget
    const todoList = blessed.list({
        parent: screen,
        label: 'To-Do List',
        keys: true,
        vi: true,
        width: '50%',
        height: '70%',
        top: '20%',
        left: '50%',
        border: {
            type: 'line'
        },
        style: {
            fg: 'white',
            bg: 'magenta',
            border: {
                fg: '#f0f0f0'
            }
        }
    });

    // Download Papers Widget
    const downloadPapersBox = blessed.box({
        parent: screen,
        label: 'Download Papers',
        content: 'Press "d" to start downloading papers...',
        width: '100%',
        height: '20%',
        top: '0%',
        left: '0%',
        border: {
            type: 'line'
        },
        style: {
            fg: 'white',
            bg: 'green',
            border: {
                fg: '#f0f0f0'
            }
        }
    });

    // Callback function to update download widget content
function updateDownloadWidget(content) {
    downloadPapersBox.setContent(content);
    screen.render();
}

// Create the domain input box
const domainInput = blessed.textbox({
    top: 'center',
    left: 'center',
    width: '50%',
    height: 'shrink',
    content: 'Enter the domain for which you want to download papers (e.g., physics): ',
    inputOnFocus: true,
    tags: true,
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'green',
        border: {
            fg: '#f0f0f0'
        }
    }
});

// Append the domainInput to the downloadPapersBox widget
downloadPapersBox.append(domainInput);
// Set focus to the input box
domainInput.focus();

// Event handler for domain input
domainInput.key(['enter'], function(ch, key) {
    const domain = domainInput.getValue();
    startDownload(domain, './downloaded_papers', updateDownloadWidget, updateTodoList, updatePapersRead);
});

// Event handler for starting downloads
screen.key(['d'], async function(ch, key) {
    const downloadedFiles = await startDownload('physics', './downloaded_papers', updateDownloadWidget, updateTodoList, updatePapersRead);
});

// Event handler for quitting the program
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});

// Array to store papers read
const papersRead = [];

// Render the screen after setting up the dashboard
screen.render();
todoList.focus();
});
