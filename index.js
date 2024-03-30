#!/usr/bin/node
// Importing required modules
const blessed = require('blessed');
const contrib = require('blessed-contrib');
const figlet = require('figlet');
const { downloader } = require('./downloader');
const fs = require('fs');
const path = require('path');

// Function to start downloading papers
async function startDownload(domain, outputPath, updateWidgetContent, updateTodoList) {
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

    // Download Papers Widget
    const downloadPapersBox = grid.set(3, 0, 6, 6, blessed.box, {
        label: 'Download Papers',
        content: 'Press "d" to start downloading papers...',
        style: { border: { fg: 'green' } }
    });

    // To-Do List Widget
    const todoList = blessed.list({
        parent: screen,
        label: 'To-Do List',
        keys: true,
        vi: true,
        width: '30%',
        height: '70%',
        top: '20%',
        left: '70%',
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

    // Callback function to update download widget content
    function updateDownloadWidget(content) {
        downloadPapersBox.setContent(content);
        screen.render();
    }

    // Callback function to update to-do list with downloaded papers
    function updateTodoList(downloadedFiles) {
        todoList.setItems(downloadedFiles.map(file => file.name));
        screen.render();
    }

    // Event handler for domain input
    const domainInput = blessed.textbox({
        parent: downloadPapersBox, // Append to downloadPapersBox widget
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
            bg: 'magenta',
            border: {
                fg: '#f0f0f0'
            }
        }
    });
    downloadPapersBox.append(domainInput); // Append the domainInput to the downloadPapersBox widget
    domainInput.focus();

    // Event handler for domain input
    domainInput.key(['enter'], function(ch, key) {
        const domain = domainInput.getValue();
        startDownload(domain, './downloaded_papers', updateDownloadWidget, updateTodoList);
    });

    // Event handler for starting downloads
    screen.key(['d'], async function(ch, key) {
        startDownload('physics', './downloaded_papers', updateDownloadWidget, updateTodoList);
    });

    // Event handler for quitting the program
    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
        return process.exit(0);
    });

    // Render the screen after setting up the dashboard
    screen.render();
});
