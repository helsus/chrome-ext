const { assert } = require('chai');
const fs = require('fs');
const NodeRSA = require('node-rsa');
const yazl = require('yazl');
const stream = require('stream');
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
      const output = await lib.archive(root, files);
      // const zip = new yazl.ZipFile();
      this.entries = [];// zip.getEntries();
    });
    test('add files to archive', async function () {
      assert.deepEqual(
        this.entries.map(i => i.name),
        ['index.js', 'manifest.json']
      );
    });
    test('add directories to archive', async function () {
      assert.deepEqual(
        this.entries.map(i => i.entryName),
        ['background/index.js', 'manifest.json']
      );
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
