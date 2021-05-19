/**
 * @license Copyright 2021 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Base64 = require('../../../../report/html/renderer/base64.js');

/* eslint-env jest */

describe('base64', () => {
  /** @type {string} */
  function test(str) {
    const roundtrip = Base64.fromBinary(Base64.toBinary(str));
    expect(roundtrip.length).toEqual(str.length);
    expect(roundtrip).toEqual(str);
  }

  it('works', () => {
    test('');
    test('hello');
    test('{åß∂œ∑´}');
    test('Some examples of emoji are 😃, 🧘🏻‍♂️, 🌍, 🍞, 🚗, 📞, 🎉, ♥️, 🍆, and 🏁.');
    test('.'.repeat(125183));
    test('😃'.repeat(125183));
    test(JSON.stringify(require('../../../../../lighthouse-treemap/app/debug.json')));
  });
});
