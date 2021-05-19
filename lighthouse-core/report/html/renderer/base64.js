/**
 * @license Copyright 2020 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/* global self btoa atob */

const encode = typeof btoa !== 'undefined' ?
  btoa :
  /** @param {string} str */
  (str) => Buffer.from(str).toString('base64');
const decode = typeof btoa !== 'undefined' ?
  atob :
  /** @param {string} str */
  (str) => Buffer.from(str, 'base64').toString();

/**
 * @param {string} string
 */
function toBinary(string) {
  // const codePoints = [...string].map(c => c.codePointAt(0) || 0);
  // return encode(String.fromCharCode(...new Uint8Array(codePoints)));

  const chunkSize = 10000;
  let str = '';
  for (let i = 0; i < string.length; i += chunkSize) {
    const codeUnits = new Uint16Array(Math.min(chunkSize, string.length - i));
    for (let i = 0; i < codeUnits.length; i++) {
      codeUnits[i] = string.charCodeAt(i);
    }
    str += String.fromCharCode(...new Uint8Array(codeUnits.buffer));
  }

  return encode(str);
}

/**
 * @param {string} encoded
 */
function fromBinary(encoded) {
  // const binary = decode(encoded);
  // const bytes = new Uint8Array(binary.length);
  // for (let i = 0; i < bytes.length; i++) {
  //   bytes[i] = binary.charCodeAt(i);
  // }
  // return String.fromCodePoint(...new Uint16Array(bytes.buffer));

  const chunkSize = 10000;
  let str = '';
  const decoded = decode(encoded);
  for (let i = 0; i < decoded.length; i += chunkSize) {
    const bytes = new Uint8Array(Math.min(chunkSize, decoded.length - i));
    for (let j = 0; j < bytes.length; j++) {
      bytes[j] = decoded.charCodeAt(i + j);
    }
    str += String.fromCharCode(...new Uint16Array(bytes.buffer));
  }

  return str;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {toBinary, fromBinary};
} else {
  self.Base64 = {toBinary, fromBinary};
}
