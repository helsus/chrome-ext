const fs = require('fs');
const recursive = require('recursive-readdir');
const ignore = require('ignore');
const yazl = require('yazl');
const { resolve, normalize } = require('path');
const { promisify } = require('util');
const NodeRSA = require('node-rsa');

const readFile = promisify(fs.readFile);
const exists = promisify(fs.exists);

/**
 * @param  {string} path
 * @return {Promise<string[]>}
 */
const filelist = async (path) => {
  const files = await recursive(path);

  if (await exists(resolve(path, '.crxignore'))) {
    const buffer = await readFile(resolve(path, '.crxignore'));
    const paths = buffer.toString().split(/\r?\n/);
    const ig = ignore().add(['.crxignore', ...paths]);

    return files.filter(ig.createFilter());
  }

  return files;
};

/**
 * @param {string} rootPath
 * @param {string[]} files
 * @return {Promise<Buffer>}
 */
const archive = (rootPath, files) => new Promise((resolve, reject) => {
  const zip = new yazl.ZipFile();
  files.forEach(file =>
    zip.addFile(file, file.slice(normalize(rootPath).length + 1)));

  zip.end();
  // zip.outputStream.pipe()
});

/**
 * @param {string} keyPath
 * @param {Buffer} content
 * @return {Promise<Buffer>}
 */
const sign = async (keyPath, content) => {
  const keyBuffer = await readFile(keyPath);

  const key = new NodeRSA(keyBuffer.toString());
  return key.sign(content);
};


module.exports = {
  filelist,
  archive,
  sign,
};
