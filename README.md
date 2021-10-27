# Node.js + TypeScript Environment Example

Node.js + TypeScript で開発する時の初期設定や手順（使用するライブラリ等）を以下にメモしておく。
なお、設定といっても必ずしも以下設定にする必要はなく、あくまで参考情報として利用すること。

## 導入ライブラリ

いくつか種類があるため、種類にわけて記載する。

```
# TypeScript
yarn add --dev typescript ts-node @types/node@<Nodeのバージョン> jest @types/jest ts-jest
```

```
# ESLint
yarn add --dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

```
# Prettier
yarn add --dev prettier eslint-config-prettier
```

```
# WebPack
yarn add --dev webpack webpack-cli webpack-node-externals ts-loader
```

```
# Pre-Commit Hook
yarn add --dev mrm lint-staged
```

```
# その他
yarn add --dev yarn-run-all rimraf
```

## 設定（TypeScript）

`npx tsc --init`を実行する。

```
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "sourceMap": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "tests/**/*.ts",
    "tests/**/*.tsx",
    "src/components/wrapper.js"
  ]
}
```

```
// jest.config.js
module.exports = {
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testEnvironment: 'node',
}
```

## 設定（ESLint）

```
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020, // Node.js 12の場合は2019、他のバージョンのNode.jsを利用している場合は場合は適宜変更する
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.eslint.json']
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [ // ルールセット
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  rules: {
    // 個別のルールを追加
  },
};
```

ESLint の推奨設定（eslint:recommended）：　https://eslint.org/docs/rules/
TypeScript 用プラグイン（型を必要としない基本ルールセット）（@typescript-eslint/recommended）
TypeScript 用プラグイン（型を必要とする基本ルールセット）（@typescript-eslint/recommended-requiring-type-checking）

```
// tsconfig.eslint.json
// ESLint用のTypeScript設定ファイル
{
  "extends": "./tsconfig.json",
  "include": [
    "src/**/*.ts",
    ".eslintrc.js"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

## 設定（Prettier）

```
// .prettierignore
# Ignore artifacts:
/dist
node_modules
package.json
package-lock.json
tsconfig.json
tsconfig.eslint.json
```

```
// .prettierrc.json
{
  "arrowParens": "avoid",
  "bracketSpacing": true,
  "embeddedLanguageFormatting": "auto",
  "htmlWhitespaceSensitivity": "css",
  "insertPragma": false,
  "printWidth": 120,
  "proseWrap": "preserve",
  "quoteProps": "as-needed",
  "requirePragma": false,
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "useTabs": false
}
```

```
// .eslintrc.js
  extends: [ // ルールセット
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
+   'prettier',
+   'prettier/@typescript-eslint',
  ],
```

## 設定（Pre-Commit Hook）

```
// package.json
{
  ...
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,ts}": "eslint --cache --fix",
    "*.ts": "tsc --noEmit",
    "*.{js,ts,json}": "prettier --write"
  }
}
```
