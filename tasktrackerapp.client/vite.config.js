import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';
    let https = false;

    if (isDev) {
        const baseFolder =
            env.APPDATA !== undefined && env.APPDATA !== ''
                ? `${env.APPDATA}/ASP.NET/https`
                : `${env.HOME}/.aspnet/https`;

        const certificateName = "tasktrackerapp.client";
        const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
        const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

        if (!fs.existsSync(baseFolder)) {
            fs.mkdirSync(baseFolder, { recursive: true });
        }

        if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
            if (0 !== child_process.spawnSync('dotnet', [
                'dev-certs',
                'https',
                '--export-path',
                certFilePath,
                '--format',
                'Pem',
                '--no-password',
            ], { stdio: 'inherit', }).status) {
                throw new Error("Could not create certificate.");
            }
        }

        https = {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        };
    }

    const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
        env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:7112';

    return {
        plugins: [plugin(), tailwindcss()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },
        server: {
            proxy: {
                '^/weatherforecast': {
                    target,
                    secure: false
                },
                "/api": {
                    target,
                    changeOrigin: true,
                    secure: false,
                    ws: true,
                    events: ["open", "message", "error", "close"],
                    configure: (proxy) => {
                        proxy.on('error', (err) => {
                            console.log('error', err);
                        });
                        proxy.on("proxyReq", (proxyReq, req) => {
                            proxyReq.setHeader("Connection", "keep-alive");
                            console.log('Request sent to target:', req.method, req.url);
                        });
                        proxy.on('proxyRes', (proxyRes, req) => {
                            console.log('Response received from target:', proxyRes.statusCode, req.url);
                        });
                    }
                }
            },
            port: parseInt(env.DEV_SERVER_PORT || '64712'),
            strictPort: true,
            https,
        }
    };
});