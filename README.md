# CMS API


## Project Origin



## Setup

- Sign-in to GitHub : https://github.com/

- Navigate from upper-right menu: Settings - Developer settings - OAuth Apps - New OAuth App

- Input App name, Homepage URL(`http://localhost:8080` for example), Callback URL(`http://localhost:8080/callback` for example), and click **Create OAuth App** button. 

- Copy `client_id`, (generated)`client_secret`, and `callback_url`, then specify them as environment values of `CLIENT_ID`, `CLIENT_SECRET`, and `CALLBACK_URL` when execute application.

- You can also specify environment values of `CORS` which indicate available from origin to execute APIs from outside of this application server.


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

