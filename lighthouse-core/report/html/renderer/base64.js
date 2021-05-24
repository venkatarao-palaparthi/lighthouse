/**
 * @license Copyright 2021 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/* global self btoa atob pako CompressionStream Response */

const toBase64 = typeof btoa !== 'undefined' ?
  btoa :
  /** @param {string} str */
  (str) => Buffer.from(str).toString('base64');
const fromBase64 = typeof atob !== 'undefined' ?
  atob :
  /** @param {string} str */
  (str) => Buffer.from(str, 'base64').toString();

/**
 * Takes an UTF-8 string and returns a URL-safe base64 encoded string.
 * If gzip is true, the UTF-8 bytes are gzipped before base64'd, using
 * CompressionStream (currently only in Chrome), falling back to pako
 * (which is only used to encode in our Node tests).
 * @param {string} string
 * @param {{gzip: boolean}} options
 * @return {Promise<string>}
 */
async function encode(string, options) {
  let bytes = new TextEncoder().encode(string);

  if (options.gzip) {
    if (typeof CompressionStream !== 'undefined') {
      const cs = new CompressionStream('gzip');
      const writer = cs.writable.getWriter();
      writer.write(bytes);
      writer.close();
      const compAb = await new Response(cs.readable).arrayBuffer();
      bytes = new Uint8Array(compAb);
    } else {
      bytes = pako.gzip(string);
    }
  }

  let binaryString = '';
  // This is ~25% faster than building the string one character at a time.
  // https://jsbench.me/2gkoxazvjl
  const chunkSize = 5000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binaryString += String.fromCharCode(...new Uint8Array(bytes.buffer.slice(i, i + chunkSize)));
  }
  return toBase64(binaryString);
}

/**
 * @param {string} encoded
 * @param {{gzip: boolean}} options
 * @return {string}
 */
function decode(encoded, options) {
  const binaryString = fromBase64(encoded);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  if (options.gzip) {
    return pako.ungzip(bytes, {to: 'string'});
  } else {
    return new TextDecoder().decode(bytes);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {encode, decode};
} else {
  self.Base64 = {encode, decode};
}
