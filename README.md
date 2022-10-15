# CMS API


## Project Origin



## Setup

- Sign-in to GitHub : https://github.com/

- Navigate from upper-right menu: Settings - Developer settings - OAuth Apps - New OAuth App

- Input App name, Homepage URL(`http://localhost:8080` for example), Callback URL(`http://localhost:8080/callback` for example), and click **Create OAuth App** button. 

- Copy `client_id`, (generated)`client_secret`, and `callback_url`, then specify them as environment values of `CLIENT_ID`, `CLIENT_SECRET`, and `CALLBACK_URL` when execute application.

- You can also specify environment values of `CORS` which indicate available from origin to execute APIs from outside of this application server.


## Client JavaScript SDK

### SDK ファイル

- `/public/cms-api.js`

### 関数リファレンス

- ログイン／ログアウト

  - apiLogin() : ログイン

  - apiLogout( redirect_url ) : ログアウト

    - redirect_url : ログアウト後のリダイレクト URL（無指定時は JSON を返す）


- スキーマ操作

  - postSchema( schema_name, schama_data, redirect_url ) : スキーマ作成

    - schema_name : スキーマ名（テーブル名）

      - 例 `'items'`

    - schema_data : スキーマデータ

      - 例 `{ name: 'string', price: 'number' }`

    - redirect_url : ログアウト後のリダイレクト URL（無指定時は JSON を返す）

  - getSchema( schema, redirect_url ) : スキーマ取得

    - schema : スキーマ名（テーブル名）

      - 例 `'items'`

    - redirect_url : データ取得後のリダイレクト URL（無指定時は JSON を返す）

  - getSchemas( redirect_url ) : スキーマ一覧取得

    - redirect_url : データ取得後のリダイレクト URL（無指定時は JSON を返す）

  - putSchema( schema_name, id, schama_data, redirect_url ) : スキーマ更新

    - schema_name : スキーマ名（テーブル名）

      - 例 `'items'`

    - id : スキーマid

      - 例 `155555555`

    - schema_data : スキーマデータ

  - deleteSchema( schema_name, redirect_url ) : スキーマ削除

    - schema_name : スキーマ名（テーブル名）

      - 例 `'items'`

    - id : スキーマid

      - 例 `155555555`


- データ操作

  - postData( schema_name, data, redirect_url ) : データ作成

    - schema_name : スキーマ名（テーブル名）

      - 例 `'items'`

    - data : テーブルデータ

      - 例 `{ name: 'string', price: 'number' }`

    - redirect_url : ログアウト後のリダイレクト URL（無指定時は JSON を返す）

  - getData( schema, redirect_url ) : データ一覧取得

    - schema : スキーマ名（テーブル名）

      - 例 `'items'`

    - redirect_url : データ取得後のリダイレクト URL（無指定時は JSON を返す）

  - putData( schema, id, data, redirect_url ) : データ更新

    - schema : スキーマ名（テーブル名）

      - 例 `'items'`

    - id : データid

      - 例 `1279648133`

    - data : テーブルデータ

      - 例 `{ name: 'string', price: 'number' }`

    - redirect_url : ログアウト後のリダイレクト URL（無指定時は JSON を返す）

  - deleteData( schema, id, data_name, redirect_url ) : データ削除

    - schema : スキーマ名（テーブル名）

      - 例 `'items'`

    - id : データid

      - 例 `1279648133`

    - data_name : テーブルデータ

      - 例 `'シャンプー'`

    - redirect_url : ログアウト後のリダイレクト URL（無指定時は JSON を返す）


- レートリミット表示

  - showRateLimitReset( headers ) : 最新レートリミット状況の表示

    - headers : 上述の関数を実行した結果のレスポンスヘッダ(`result.res_headers`)


- リッチテキスト操作

  - toRichText( content ) : リッチテキストへ変換

    - content : 変換前リッチテキスト（マークダウンテキスト）

    - 返り値 : `text/markdown | content`

  - fromRichText( richtext ) : リッチテキストから変換

    - richtext : `text/markdown | content`

    - 返り値 : `content`


- バイナリデータ操作

  - (async) toBinaryById( id ) : バイナリデータへ変換

    - id : `type=file` の input 要素の id

    - 返り値 : `contenttype | (base64テキスト)`

  - fromBinary( binary ) : バイナリデータから変換

    - binary : `contenttype | (base64テキスト)`

    - 返り値 : `data:contenttype;base64,(base64テキスト)`


## APIs

- `GET /api/github/issues/:user/:repo`

  - Get issues of `:user/:repo` repository.

  - Query parameters:

    - `filter` : Indicates which sorts of issues, one of those: [ 'assigned', 'created', 'mentioned', 'subscribed', 'repos', 'all' ]

    - `state` : Status of issue, one of those: [ 'all', 'open', 'closed' ]

    - `labels` : List of comma separated label names

    - `token` : Specify OAuth2 token or Personal access token, which is needed if repository would be private.

- `GET /api/github/comments/:user/:repo`

  - Get comments of `:user/:repo` repository.

  - Query parameters:

    - `issue_num` : Specify one issue by number

    - `token` : Specify OAuth2 token or Personal access token, which is needed if repository would be private.

Following APIs are not used in this GHaC application:

- `GET /api/github/assignees/:user/:repo`

  - Get assignees of `:user/:repo` repository.

  - Query parameters:

    - `token` : Specify OAuth2 token or Personal access token, which is needed if repository would be private.

- `GET /api/github/labels/:user/:repo`

  - Get labels of `:user/:repo` repository.

  - Query parameters:

    - `token` : Specify OAuth2 token or Personal access token, which is needed if repository would be private.

- `GET /api/github/milestones/:user/:repo`

  - Get milestones of `:user/:repo` repository.

  - Query parameters:

    - `token` : Specify OAuth2 token or Personal access token, which is needed if repository would be private.


## References

https://docs.github.com/ja/rest/issues


## Licensing

This code is licensed under MIT.


## Copyright

2022 K.Kimura @ Juge.Me all rights reserved.

