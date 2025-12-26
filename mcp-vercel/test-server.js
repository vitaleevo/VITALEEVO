import fetch from 'node-fetch';
import { spawn } from 'child_process';

const token = "mqL0S9hxx3i5K3qQa19DJJiR";

async function testMcp() {
    const child = spawn('node', ['index.js'], {
        cwd: './',
        env: { ...process.env, VERCEL_TOKEN: token }
    });

    child.stderr.on('data', (data) => console.log('STDERR:', data.toString()));

    const request = {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
        params: {}
    };

    child.stdin.write(JSON.stringify(request) + '\n');

    child.stdout.on('data', (data) => {
        console.log('STDOUT:', data.toString());
        process.exit(0);
    });

    setTimeout(() => {
        console.log('Timeout');
        child.kill();
        process.exit(1);
    }, 5000);
}

testMcp();
