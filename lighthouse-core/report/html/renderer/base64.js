/**
 * @license Copyright 2021 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/* global self btoa atob pako CompressionStream Response */

const encode = typeof btoa !== 'undefined' ?
  btoa :
  /** @param {string} str */
  (str) => Buffer.from(str).toString('base64');
const decode = typeof atob !== 'undefined' ?
  atob :
  /** @param {string} str */
  (str) => Buffer.from(str, 'base64').toString();

/**
 * @param {string} string
 * @param {{gzip: boolean}} options
 * @return {Promise<string>}
 */
async function toBinary(string, options) {
  let bytes;
  if (options.gzip) {
    if (typeof CompressionStream !== 'undefined') {
      const cs = new CompressionStream('gzip');
      const writer = cs.writable.getWriter();
      writer.write(new TextEncoder().encode(string));
      writer.close();
      const compAb = await new Response(cs.readable).arrayBuffer();
      bytes = new Uint8Array(compAb);
    } else {
      bytes = pako.gzip(string);
    }
  } else {
    bytes = new TextEncoder().encode(string);
  }

  let binaryString = '';
  // This is ~25% faster than building the string one character at a time.
  // https://jsbench.me/2gkoxazvjl
  const chunkSize = 5000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binaryString += String.fromCharCode(...new Uint8Array(bytes.buffer.slice(i, i + chunkSize)));
  }
  return encode(binaryString);
}

/**
 * @param {string} encoded
 * @param {{gzip: boolean}} options
 * @return {string}
 */
function fromBinary(encoded, options) {
  const binaryString = decode(encoded);
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
  module.exports = {toBinary, fromBinary};
} else {
  self.Base64 = {toBinary, fromBinary};
}
