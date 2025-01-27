// 使用 createRequire 来支持 require 语法
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const forge = require('node-forge');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 正确处理 ESM 中的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 使用 path.resolve 确保路径正确
const certDir = path.resolve(__dirname, '..', 'cert');

// 确保证书目录存在
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true, mode: 0o755 });
}

// 生成证书
const keys = forge.pki.rsa.generateKeyPair(2048);
const cert = forge.pki.createCertificate();

cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [{
  name: 'commonName',
  value: 'localhost'
}, {
  name: 'countryName',
  value: 'US'
}, {
  shortName: 'ST',
  value: 'Virginia'
}, {
  name: 'localityName',
  value: 'Blacksburg'
}, {
  name: 'organizationName',
  value: 'Test'
}, {
  shortName: 'OU',
  value: 'Test'
}];

cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.sign(keys.privateKey);

// 导出证书和私钥
const certPem = forge.pki.certificateToPem(cert);
const keyPem = forge.pki.privateKeyToPem(keys.privateKey);

// 保存文件
fs.writeFileSync(path.resolve(certDir, 'cert.pem'), certPem, { mode: 0o644 });
fs.writeFileSync(path.resolve(certDir, 'key.pem'), keyPem, { mode: 0o644 });

console.log('SSL certificate generated successfully!'); 