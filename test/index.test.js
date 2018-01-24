const { assert } = require('chai');
const fs = require('fs');
const NodeRSA = require('node-rsa');
const { promisify } = require('util');
const lib = require('../src');

const readFile = promisify(fs.readFile);


suite('src/index.js', function () {
  suite('#filelist()', function () {
    test('returns all files (except ignored) recursively', async function () {
      assert.deepEqual(
        await lib.filelist('./test/fixtures'),
        ['test/fixtures/manifest.json', 'test/fixtures/background/index.js'],
      );
    });
  });

  suite('#archive()', function () {
    setup(async function () {
      const root = './test/fixtures';
      const files = await lib.filelist(root);
      this.output = await lib.archive(root, files);
    });
    test('snapshot', async function () {
      const snapshot = await readFile('./test/snapshots/archive');
      assert.equal(this.output.toString('base64'), snapshot);
    });
  });

  suite('#sign()', function () {
    test('returns correct signature', async function () {
      const content = new Buffer('Some-buffer-to-sign');

      const signature = await lib.sign('./test/fixtures/key.pem', content);
      const keyBuffer = await readFile('./test/fixtures/key.pem');
      const key = new NodeRSA(keyBuffer.toString());

      assert.isTrue(key.verify(content, signature));
    });
  });
});
