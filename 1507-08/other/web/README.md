# ATS-Web の役割
- 静的なアセット(HTML,JS,CSS,画像・フォントファイル等)によるWebアプリケーションで、UIを司ります
- データの取得／更新等は ATS-API のPlayアプリケーションが責任を持ちます


# ATS-Web ローカル開発

## 基本
- クライアントアプリケーションの元となるファイルは全て src ディレクトリに配置します
- gulp build を実行すると、配信用のファイルが dist ディレクトリに出力されます
- gulp webserver がコンテンツ配信、およびAPIへのリバースプロキシを実現します

## Gulp のはじめかた

```
$ cd stanby-ats-web
$ npm install

# (これだけでOK) ファイルの変更を検知して、継続的に "gulp build" し続けてくれます、同時に webserver としても動作します
gulp watch


### 下記も覚えても良いかも ###

# src を元に ビルド成果物を dist に吐き出す
gulp build

# webサーバを立ち上げる (localhost:9010)
gulp webserver

```


## プロジェクト構成

※　ほとんどの人が気にしなくて良いディレクトリについては言及しません

```
├── api
├── bower_components
├── dist                      // (gitignore) srcディレクトリ内のファイルがビルドされた成果物が出力される
│   ├── pages
│   ├── assets
│   └── rev-manifest
├── gulptasks                 // gulp でのビルドタスクを定義するファイル
├── mocks
├── node_modules              // (gitignore) npm install で node モジュールが吐かれる場所
└── src
│   ├── ejs                   // html テンプレート: hoge.html.ejs -> hoge.html となる
|        ├── pages            // Webページ と 1対1になる HTMLファイルの元ファイル (xx.html.ejs)
│        ├── layout           // 上記 pages の共通テンプレート(ヘッダ・フッター等)
|        ├── internal         // 他の ejs から include されるのみの想定のファイル (xx.ejs)
│        └── templates        // ajax 等で取得される想定の html のテンプレート (xx.html.ejs)
├── images
├── javascripts
│   └── vendor                // 基本的にベンダーのみ、独自の実装はTypescriptにて
├── scripts                   // TypeScript の実装 (下記参照)
|  ├─ controllers
|  ├─ services
|  ├─ directives
|  ├─ filters
|  ├─ models
|  |
|  ├─ stanby-app.ts
|  ├─ jobs-page.ts
|  └─ users-page.ts
├── pdfviewer
├── published                 // Play2-nashorn で出力した Webページから参照されるアセット
└── stylesheets

```
