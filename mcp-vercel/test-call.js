import { spawn } from 'child_process';

const token = "mqL0S9hxx3i5K3qQa19DJJiR";

async function testCall() {
    const child = spawn('node', ['index.js'], {
        cwd: './',
        env: { ...process.env, VERCEL_TOKEN: token }
    });

    const request = {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
            name: "list_projects",
            arguments: {}
        }
    };

    child.stdin.write(JSON.stringify(request) + '\n');

    child.stdout.on('data', (data) => {
        const response = JSON.parse(data.toString());
        console.log('Vercel Response Received');
        if (response.result && response.result.content) {
            const projects = JSON.parse(response.result.content[0].text);
            console.log('Found projects:', projects.projects?.length || 0);
        } else {
            console.log('Error or empty response:', JSON.stringify(response, null, 2));
        }
        process.exit(0);
    });

    child.stderr.on('data', (data) => {
        if (data.toString().includes('Error')) {
            console.error('STDERR Error:', data.toString());
        }
    });

    setTimeout(() => {
        console.log('Timeout');
        child.kill();
        process.exit(1);
    }, 10000);
}

testCall();
