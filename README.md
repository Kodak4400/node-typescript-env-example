# TypeScript を使った開発環境の構築手順（Node版） 2022.09時点

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

### 1. TypeScript

```
yarn add --dev typescript ts-node @types/node@<Nodeのバージョン>
```

### 2. ESLint

```
yarn add --dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-standard-with-typescript eslint-plugin-promise eslint-plugin-import
```

### 3. Prettier
VS Codeの拡張機能「Prettier」を入れておく

```
yarn add --dev prettier eslint-config-prettier
```

### 4. Jest

```
// @swc/jest用
yarn add -dev jest @types/jest @swc/core @swc/jest

// ts-jest用
yarn add -dev jest @types/jest ts-jest
```

### 5. Simple Git Hooks

```
yarn add --dev simple-git-hooks lint-staged
```

### 6. webpack

```
yarn add --dev webpack webpack-cli webpack-node-externals ts-loader
```

### 7. jsdoc
VS Codeの拡張機能「Document This」を入れておく

```
yarn add --dev jsdoc
```

### 8. build ファイルの削除

```
yarn add --dev rimraf
```


## 導入ライブラリの設定（xxxx.config.js の設定方法）

### 1. TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false, // 様子見。
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext", // commonjsじゃなくてOKか様子見。
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "noEmit": true,
    "baseUrl": "src"
  },
  "include": ["src"],
}
```

### 2. ESLint

```json
// .eslintrc.json
{
  "env": {
    "node": true,
    "es2022": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "standard-with-typescript", // https://github.com/standard/eslint-config-standard-with-typescript
    "prettier"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "tsconfigRootDir": ".",
    "project": ["./tsconfig.json"],
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    // 随時追加予定。
    "@typescript-eslint/consistent-type-definitions": "off", // type or interfaceのどちらかには統一しない。
    "@typescript-eslint/explicit-function-return-type": "off", // returnの型宣言の強制はしたくない。
    "@typescript-eslint/strict-boolean-expressions": [
      "error",
      {
        "allowNullableObject": true
      }
    ]
  },
  "overrides": [],
  "settings": {}
}
```

## 3. Prettier

```json
// .prettierrc.json
// 内容 => https://qiita.com/takeshisakuma/items/bbb2cd2f1c65de70e363
{
  "singleQuote": true,
  "endOfLine": "auto"
}
```

```js
// .eslintrc.json
// Prettierを追加した場合は、ESLintのconfigにPrettier用のルールセットの追加が必要
  extends: [ // ルールセット
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "standard-with-typescript", // https://github.com/standard/eslint-config-standard-with-typescript
+   "prettier",
  ],
```

ESLint と Prettier は、一部の機能が重複している。
そのため、ESLint と Prettier の役割を以下のように分けるようにする。

- コード品質のチェック => ESLint
- コードフォーマット => Prettier

ESLint の config の extends の最後に'prettier'を書くことで、ESLint 内で行っているコードフォーマットを Prettier で上書き、上記のように役割を分けて動かすようにする。

### 4. Jest

```json
// @swc/jest用
// jest.config.json
{
  "transform": {
    "^.+\\.(t|j)sx?$": ["@swc/jest"]
  },
  "testEnvironment": "node"
}
```

```json
// .swcrc
{
  "$schema": "https://json.schemastore.org/swcrc",
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "dynamicImport": false,
      "decorators": false
    },
    "target": "es2022",
    "loose": false,
    "externalHelpers": false
  },
  "minify": false
}
```

### 5. Simple Git Hooks

```json
// package.json
{
  "scripts": {
    "prepare": "npx simple-git-hooks || :"
  },
  ...
  "lint-staged": {
    "src/**/*.{js,ts}": [
      "prettier --write --loglevel=warn",
      "eslint --fix --quiet"
    ],
    "src/**/*.{json}": [
      "prettier --write --loglevel=error"
    ]
  },
  "simple-git-hooks": {
    "pre-commit": "npx lint-staged"
  }
}
```

## 6. webpack

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

## 7. jsdoc

（一旦）設定は特に不要。
VSCode の拡張機能「Document This」と連携して、補完が効くようにしておく。

＊ドキュメントとして出力するようなケースが増えてきた場合は、設定を検討する！


## 8. build ファイルの削除

```json
// package.json
{
  "script": {
    "clean": "rimraf dist/*"
  }
}
```


## 9. その他

VS Codeの設定

```json
// settings.json
{
  "less.validate": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": false,
  "editor.lineNumbers": "on",
  "editor.rulers": [
    80
  ],
  "editor.tabSize": 2,
  "editor.wordWrap": "on",
  "eslint.packageManager": "yarn",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,
  "npm.packageManager": "yarn",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "[javascript]": {
    "editor.formatOnSave": true
  },
  "[json]": {
    "editor.formatOnSave": true
  },
  "[typescript]": {
    "editor.formatOnSave": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

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
