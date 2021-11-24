# TypeScript を使った開発環境の構築方法について

## はじめに

TypeScript を使って開発する際、開発環境を整えるのに非常に時間が掛かるため、最低限必要な開発環境を用意する手順を以下に記載する。  
なお、開発環境は要件によって設定内容が異なるため、必ずしも以下設定にする必要はなく、あくまで参考情報として利用すること。

## 開発環境構築手順

1. 使用する Node.js のバージョンを決める。
2. Node.js のバージョンを決めたら、nvm からそのバージョンの Node.js をインストールする。
3. nvm で使用する Node.js のバージョンを変更したら、yarn を global インストールする。(npm install -g yarn)
4. 導入するライブラリを決めて、インストールする。

## 導入ライブラリ

以降、種類にわけて記載する。

### 1. TypeScript / Jest

```
yarn add --dev typescript ts-node @types/node@<Nodeのバージョン> jest @types/jest ts-jest
```

### 2. ESLint

```
yarn add --dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### 3. Prettier

```
yarn add --dev prettier eslint-config-prettier
```

### 4. webpack

```
yarn add --dev webpack webpack-cli webpack-node-externals ts-loader
```

### 5. build ファイルの削除

```
yarn add --dev rimraf
```

### 6. jsdoc

```
// なお、VSCodeの拡張機能「Document This」を入れておくと良い
yarn add --dev jsdoc
```

### 7. debug

// vscode の設定

### 8. [未確認]Pre-Commit Hook

```
yarn add --dev mrm lint-staged
```

## 導入ライブラリの設定（xxxx.config.js の設定方法）

### 1. TypeScript / Jest

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020", // トランスパイルした後のターゲットを指定（Babelでも同様のことができるが、TypeScriptを導入していればBabelは不要）
    "module": "commonjs", // common.jsかクライアントサイドならamdが一般的だが、最近はumdを設定することが多い。 => https://qiita.com/suin/items/3a73eb73eea51cfca9e1
    "sourceMap": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true, // *.d.tsファイルの型チェックをスキップする
    "forceConsistentCasingInFileNames": true // import時にファイルパスの文字列で大文字小文字を区別する
  },
  "include": [
    // コンパイル対象（要件に合わせて設定してください）
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "tests/**/*.ts",
    "tests/**/*.tsx"
  ]
}
```

```js
// jest.config.js
module.exports = {
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testEnvironment: 'node', // テスト環境。ブラウザ環境でテストしたい場合は`jsdom`を設定する
}
```

### 2. ESLint

```js
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    // グローバル変数の設定。 => https://eslint.org/docs/user-guide/configuring/language-options#specifying-environments
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser', // ESLintがTypeScriptを理解するParserを指定
  parserOptions: {
    sourceType: 'module', // これがないとパースできない
    project: ['./tsconfig.eslint.json'], // TypeScriptの対象を指定
  },
  plugins: [
    '@typescript-eslint', // TypeScript用ESLintのルールプラグインを導入
  ],
  extends: [
    // ルールセット
    'eslint:recommended', // ESLintの推奨設定（eslint:recommended）：　https://eslint.org/docs/rules/
    'plugin:@typescript-eslint/recommended', // TypeScript用ルールセット（型を必要としない基本ルールセット）（@typescript-eslint/recommended）
    'plugin:@typescript-eslint/recommended-requiring-type-checking', // TypeScript用ルールセット（型を必要とする基本ルールセット）（@typescript-eslint/recommended-requiring-type-checking）
  ],
  rules: {
    // 個別のルールがある場合は追記
  },
}
```

```json
// tsconfig.eslint.json
// ESLintがTypeScript読み込み時にParserを使用するが、そのParserの対象とconfigの指定
{
  "extends": "./tsconfig.json",
  "include": [
    "src/**/*.ts",
    "tests/**/*.ts"
    ".eslintrc.js"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

```js
// .eslintignore
// configファイル等がESlintの対象になってしまうため、対象からはずす
jest.config.js
webpack.config.js
dist
```

## 3. Prettier

```js
// .prettierignore
dist
node_modules
package.json
package - lock.json
tsconfig.json
tsconfig.eslint.json
```

```json
// .prettierrc.json
// 内容 => https://qiita.com/takeshisakuma/items/bbb2cd2f1c65de70e363
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

```js
// .eslintrc.js
// Prettierを追加した場合は、ESLintのconfigにPrettier用のルールセットの追加が必要
  extends: [ // ルールセット
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
+   'prettier',
+   'prettier/@typescript-eslint', // <= v8.0.0以降はこちらも不要(https://github.com/prettier/eslint-config-prettier/blob/v8.1.0/CHANGELOG.md#version-800-2021-02-21)
  ],
```

ESLint と Prettier は、一部の機能が重複している。
そのため、ESLint と Prettier の役割を以下のように分けるようにする。

- コード品質のチェック => ESLint
- コードフォーマット => Prettier

ESLint の config の extends の最後に'prettier'を書くことで、ESLint 内で行っているコードフォーマットを Prettier で上書き、上記のように役割を分けて動かすようにする。

## 4. webpack

```js
// webpack.config.js
const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  target: 'node',
  entry: {
    main: path.resolve(__dirname, './src/main.ts'),
  },
  // build時は`dependencies`だけを読み込むようにする
  externals: [
    nodeExternals({
      modulesFromFile: {
        includeInBundle: ['dependencies'],
        excludeFromBundle: ['devDependencies'],
      },
    }),
  ],

  output: {
    filename: '[name]/index.js',
    path: path.resolve(__dirname, './dist/'),
    libraryTarget: 'commonjs2', // ライブラリの形式 tsconfig.jsonのmoduleとほぼ同じ。commonjs2かクライアントサイドならumdを設定することが多い。
  },
  // source-mapの種類 => https://webpack.js.org/configuration/devtool/
  devtool: 'inline-source-map',

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: path.resolve(__dirname, './node_modules'),
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },
}
```

## 5. build ファイルの削除

```json
// package.json
{
  "script": {
    "clean": "rimraf dist/*"
  }
}
```

## 6. jsdoc

（一旦）設定は特に不要。
VSCode の拡張機能「Document This」と連携して、補完が効くようにしておく。

＊ドキュメントとして出力するようなケースが増えてきた場合は、設定を検討する！

## 7. debug

```json
//.launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch TypeScript Using ts-node",
      "type": "pwa-node",
      "request": "launch",
      "skipFiles": ["<node_internals>/**", "node_modules/**"],
      "cwd": "${workspaceFolder}/typescript/example-app", // debugするProjectディレクトリを指定
      // "program": "${file}",
      "runtimeExecutable": "npm", // package.jsonのscriptsのdebugコマンドと紐付ける
      "runtimeArgs": ["run-script", "debug"]
      // "runtimeArgs": [
      //   "--nolazy",
      //   "-r",
      //   "ts-node/register"
      // ],
    }
  ]
}
```

```json
// package.json
{
  "engines": {
    "node": "16.x" // 誤ったNode.jsのバージョンで動かさない様に指定しておくと◎
  },
  "scripts": {
    "debug": "ts-node src/main.ts"
  }
}
```

## [未確認]Pre-Commit Hook

```json
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
