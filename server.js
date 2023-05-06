const http = require('http');
const fs = require('fs');
const readline = require('readline');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    fs.readFile(templateFilePath, 'utf-8', (err, template) => {
        if (err) {
            console.error(`Error reading template file: ${err.message}`);
            res.end('Internal Server Error');
            return;
        }

        fs.readFile(dataFilePath, 'utf-8', (err, data) => {
            if (err) {
                console.error(`Error reading data file: ${err.message}`);
                res.end('Internal Server Error');
                return;
            }

            try {
                const jsonData = JSON.parse(data);

                const html = template.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
                    return jsonData[variable] || '';
                });

                res.end(html);
            } catch (error) {
                console.error(`Error parsing JSON data: ${error.message}`);
                res.end('Internal Server Error');
            }
        });
    });
});

server.listen(3000, () => {
    console.log('Server started on http://localhost:3000');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter the path to the HTML template file: ', (templateFilePath) => {
        rl.question('Enter the path to the JSON data file: ', (dataFilePath) => {
            global.templateFilePath = templateFilePath;
            global.dataFilePath = dataFilePath;

            if (!fs.existsSync(templateFilePath)) {
                console.error(`Template file does not exist: ${templateFilePath}`);
                process.exit(1);
            }

            if (!fs.existsSync(dataFilePath)) {
                console.error(`Data file does not exist: ${dataFilePath}`);
                process.exit(1);
            }

            rl.close();
        });
    });
});