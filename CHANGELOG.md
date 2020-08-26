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
