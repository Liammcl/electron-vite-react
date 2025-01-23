import forge from 'node-forge';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建证书目录
const certDir = path.join(__dirname, '..', 'cert');
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir);
}

// 生成密钥对
const keys = forge.pki.rsa.generateKeyPair(2048);

// 创建证书
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

// 设置证书属性
const attrs = [{
  name: 'commonName',
  value: 'localhost'
}, {
  name: 'countryName',
  value: 'CN'
}, {
  shortName: 'ST',
  value: 'State'
}, {
  name: 'localityName',
  value: 'City'
}, {
  name: 'organizationName',
  value: 'Dev Cert'
}, {
  shortName: 'OU',
  value: 'Dev'
}];

cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.sign(keys.privateKey);

// 导出证书和私钥
const certPem = forge.pki.certificateToPem(cert);
const keyPem = forge.pki.privateKeyToPem(keys.privateKey);

// 保存文件
fs.writeFileSync(path.join(certDir, 'cert.pem'), certPem);
fs.writeFileSync(path.join(certDir, 'key.pem'), keyPem);

console.log('证书已生成在 cert 目录中'); 