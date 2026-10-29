### 2.4.0

- `asr2js`: update rdotjson to 2.1.0, which now decodes `\t` and `\uXXXX` and keeps non-breaking spaces itself ([kawanet/rdotjson#14](https://github.com/kawanet/rdotjson/pull/14)), so the workaround from 2.3.12 is gone; a non-breaking space written as `&#160;` is kept now too, and a `<string>` without a `name` attribute is skipped instead of coming in as the key `undefined`
- rdotjson 2.1.0 requires Node.js 20.19 or later, and parses with htmlparser2 instead of cheerio (a smaller browser bundle)

### 2.3.12

- `js2asr`: backslashes are escaped, so a value with a backslash (a Windows path, a regex) reaches the app and survives a round trip unchanged. A value that holds a typed Android escape such as `\n` or `\u2605` is now written literally (`\\n`) and shows as such in the app; store the real character instead (a line break, ★) ([#5](https://github.com/locize/android-string-resource/pull/5), by [@Pharex38](https://github.com/Pharex38))
- `asr2js`: `\t` and `\uXXXX` are decoded as Android decodes them (they came in as "t" and "u2605"), and a non-breaking space (and the other non-ASCII spaces) is kept instead of turning into a normal space
- `asr2js`: plural items decode their escapes (`\n`, `\"`, `\'`, `\\`, `\uXXXX`) like strings do; they came in with the backslashes
- `js2asr`: a tab is written as `\t`, and a value that starts with `@` or `?` is escaped (`\@`, `\?`), which Android would otherwise read as a resource or style reference

### 2.3.11

- js2asr: a string-array whose items carry comments is written again (it was dropped, and with plurals present the output could break) [#4](https://github.com/locize/android-string-resource/pull/4)
- js2asr: skip `null` values instead of throwing [#4](https://github.com/locize/android-string-resource/pull/4)
- asr2js: invoke the callback only once when it throws [#4](https://github.com/locize/android-string-resource/pull/4)

### 2.3.10

- update dependencies

### 2.3.9

- update dependencies

### 2.3.8

- fix escaping in plurals

### 2.3.7

- fix fallback for empty string-array elements

### 2.3.6

- fallback for empty string-array elements

### 2.3.5

- fix double callback invocation

### 2.3.4

- fallback for false arrays

### 2.3.3

- transpile also esm

### 2.3.2

- special handling for apos in html

### 2.3.1

- better trim

### 2.3.0

- get rid of unnecessary CDATA

### 2.2.2

- fix detection of xliff:g

### 2.2.1

- fix xmlns:xliff attribute

### 2.2.0

- replace xml2js with xml-js

### 2.1.0

- basic handling for <xliff:g> tags
- plurals handling

### 2.0.3

- fix export for node v14 cjs

### 2.0.2

- fix export for dynamic imports

### 2.0.1

- fix function override

### 2.0.0

- complete refactoring to make this module universal
- MIGRATION:
    - `require('android-string-resource/asr2js')` should be replaced with `require('android-string-resource/cjs/asr2js')`
    - `require('android-string-resource/js2asr')` should be replaced with `require('android-string-resource/cjs/js2asr')`
