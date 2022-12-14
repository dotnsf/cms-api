//. app.js
var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    cookieParser = require( 'cookie-parser' ),
    ejs = require( 'ejs' ),
    fs = require( 'fs' ),
    http = require( 'http' ),
    https = require( 'https' ),
    session = require( 'express-session' ),
    request = require( 'request' ),
    app = express();

require( 'dotenv' ).config();

app.use( session({
  secret: 'cms-api',
  resave: false,
  saveUninitialized: true, //false,
  cookie: {
    //domain: "ghac.me",
    httpOnly: true,
    secure: false,
    maxage: 1000 * 60 * 10   //. 10min
  }
}));

//. User-Agent
const USER_AGENT = 'CMS-API';

//. SSL
var options = {};
if( 'SSL_KEY' in process.env && process.env.SSL_KEY ){
  options.key = fs.readFileSync( process.env.SSL_KEY );
}
if( 'SSL_CERT' in process.env && process.env.SSL_CERT ){
  options.cert = fs.readFileSync( process.env.SSL_CERT );
}
if( 'SSL_CA' in process.env && process.env.SSL_CA ){
  options.ca = fs.readFileSync( process.env.SSL_CA );
}


app.use( cookieParser() );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( express.Router() );
app.use( express.static( __dirname + '/public' ) );

app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'ejs' );


var api_server = 'API_SERVER' in process.env && process.env.API_SERVER ? process.env.API_SERVER : 'api.github.com';
var api_server_base = 'https://' + api_server + '/repos/';

//. GitHub API
app.getMe = async function( token ){
  return new Promise( async function( resolve, reject ){
    if( token ){
      var option = {
        url: 'https://' + api_server + '/user',
        headers: { Authorization: 'token ' + token, 'User-Agent': USER_AGENT },
        method: 'GET'
      };
      request( option, function( err, res0, body ){
        if( err ){
          console.log( { err } );
          resolve( { status: false, error: err } );
        }else{
          if( typeof body == 'string' ){
            body = JSON.parse( body );
          }
          //. { login: 'dotnsf', id: XXXX, avatar_url: 'https://xxx', name: '???????????????', email: 'dotnsf@gmail.com', .. }
          resolve( { status: true, user: body } );
        }

      });
    }else{
      resolve( { status: false, error: 'token needed.' } );
    }
  });
};


//. #9
var GITHUB_REPO = 'GITHUB_REPO' in process.env && process.env.GITHUB_REPO ? process.env.GITHUB_REPO : '';

app.postSchema = async function( repo, title, token, schema_data ){
  return new Promise( async function( resolve, reject ){
    repo = repo ? repo : GITHUB_REPO;
    var r0 = await app.getSchemas( repo, token );
    if( r0 && r0.status && r0.schemas ){
      var number = -1;
      for( var i = 0; i < r0.schemas.length && number == -1; i ++ ){
        if( title == r0.schemas[i].title ){
          number = r0.schemas[i].number;
        }
      }

      if( number > -1 ){
        //. ????????????????????????
        resolve( { status: false, error: 'already registered schema with title = "' + title + '".' } );
      }else{
        var url = api_server_base + repo + '/issues';
        if( typeof schema_data == 'object' ){
          schema_data = JSON.stringify( schema_data );
        }

        var options = {
          url: url,
          method: 'POST',
          json: { title: title, body: schema_data },
          headers: { Accept: 'application/json', 'User-Agent': USER_AGENT }
        };
        if( token ){
          options.headers.Authorization = 'token ' + token;
        }
        request( options, ( err, res, body ) => {
          if( err ){
            console.log( { err } );
            resolve( { status: false, error: err } );
          }else{
            if( typeof body == 'string' ){
              body = JSON.parse( body );
            }
            //console.log( { body } );  //. ?????????????????????????????????????????? { "message": "API rate limit  exceeded for xx.xx.xx.xx. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)","documentation_url":"https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting" }
            if( body.message ){
              resolve( { status: false, error: body } );
            }else{
              var t = body.body;
              if( typeof t == 'string' ){ t = JSON.parse( t ); }
              var newschema_data = t;
              resolve( { status: true, res_headers: res.headers, title: body.title, schema: newschema_data } );
            }
          }
        });
      }
    }else{
      resolve( { status: false, error: 'failed to get schemas.' } );
    }
  });
};

app.getSchemas = async function( repo, token ){
  return new Promise( async function( resolve, reject ){
    repo = repo ? repo : GITHUB_REPO;
    var url = api_server_base + repo + '/issues?state=open';

    var options = {
      url: url,
      method: 'GET',
      headers: { Accept: 'application/json', 'User-Agent': USER_AGENT }
    };
    if( token ){
      options.headers.Authorization = 'token ' + token;
    }
    request( options, ( err, res, body ) => {
      if( err ){
        console.log( { err } );
        resolve( { status: false, error: err } );
      }else{
        if( typeof body == 'string' ){
          body = JSON.parse( body );
        }
        //console.log( { body } );  //. ?????????????????????????????????????????? { "message": "API rate limit  exceeded for xx.xx.xx.xx. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)","documentation_url":"https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting" }
        if( body.message ){
          resolve( { status: false, error: body } );
        }else{
          var newschema_data = [];
          for( var i = 0; i < body.length; i ++ ){
            var t = body[i].body;
            if( typeof t == 'string' ){ t = JSON.parse( t ); }
            newschema_data.push( { title: body[i].title, number: body[i].number, schema: t } );
          }

          resolve( { status: true, res_headers: res.headers, schemas: newschema_data } );
        }
      }
    });
  });
};

app.getSchema = async function( repo, title, token ){
  return new Promise( async function( resolve, reject ){
    repo = repo ? repo : GITHUB_REPO;
    var r0 = await app.getSchemas( repo, token );
    if( r0 && r0.status && r0.schemas ){
      var idx = -1;
      var number = -1;
      for( var i = 0; i < r0.schemas.length && idx == -1; i ++ ){
        if( title == r0.schemas[i].title ){
          idx = i;
          number = r0.schemas[i].number;
        }
      }

      if( idx > -1 ){
        resolve( { status: true, res_headers: r0.res_headers, number: number, schema: r0.schemas[idx] } );
      }else{
        resolve( { status: false, error: 'not found for schema with title = "' + title + '".' } );
      }
    }else{
      resolve( { status: false, error: 'failed to get schemas.' } );
    }
  });
};

app.putSchema = async function( repo, title, token, schema_data ){
  return new Promise( async function( resolve, reject ){
    repo = repo ? repo : GITHUB_REPO;
    var r0 = await app.getSchemas( repo, token );
    if( r0 && r0.status && r0.schemas ){
      var number = -1;
      for( var i = 0; i < r0.schemas.length && number == -1; i ++ ){
        if( title == r0.schemas[i].title ){
          number = r0.schemas[i].number;
        }
      }

      if( number > -1 ){
        var url = api_server_base + repo + '/issues/' + number;

        if( typeof schema_data == 'object' ){
          schema_data = JSON.stringify( schema_data );
        }

        var options = {
          url: url,
          method: 'PATCH',
          json: { title: title, body: schema_data },
          headers: { Accept: 'application/json', 'User-Agent': USER_AGENT }
        };
        if( token ){
          options.headers.Authorization = 'token ' + token;
        }
        request( options, ( err, res, body ) => {
          if( err ){
            console.log( { err } );
            resolve( { status: false, error: err } );
          }else{
            if( typeof body == 'string' ){
              body = JSON.parse( body );
            }
            //console.log( { body } );  //. ?????????????????????????????????????????? { "message": "API rate limit  exceeded for xx.xx.xx.xx. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)","documentation_url":"https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting" }
            if( body.message ){
              resolve( { status: false, error: body } );
            }else{
              var t = body.body;
              if( typeof t == 'string' ){ t = JSON.parse( t ); }
              var newschema_data = t;
              resolve( { status: true, res_headers: res.headers, title: body.title, schema: newschema_data } );
            }
          }
        });
      }else{
        resolve( { status: false, error: 'not found for schema with title = "' + title + '".' } );
      }
    }else{
      resolve( { status: false, error: 'failed to get schemas.' } );
    }
  });
};

app.deleteSchema = async function( repo, title, token ){
  return new Promise( async function( resolve, reject ){
    repo = repo ? repo : GITHUB_REPO;
    var r0 = await app.getSchemas( repo, token );
    if( r0 && r0.status && r0.schemas ){
      var number = -1;
      for( var i = 0; i < r0.schemas.length && number == -1; i ++ ){
        if( title == r0.schemas[i].title ){
          number = r0.schemas[i].number;
        }
      }

      if( number > -1 ){
        var url = api_server_base + repo + '/issues/' + number;

        var options = {
          url: url,
          method: 'PATCH',
          json: { state: 'closed' },
          headers: { Accept: 'application/json', 'User-Agent': USER_AGENT }
        };
        if( token ){
          options.headers.Authorization = 'token ' + token;
        }
        request( options, ( err, res, body ) => {
          if( err ){
            console.log( { err } );
            resolve( { status: false, error: err } );
          }else{
            if( typeof body == 'string' ){
              body = JSON.parse( body );
            }
            //console.log( { body } );  //. ?????????????????????????????????????????? { "message": "API rate limit  exceeded for xx.xx.xx.xx. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)","documentation_url":"https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting" }
            if( body.message ){
              resolve( { status: false, error: body } );
            }else{
              var t = body.body;
              if( typeof t == 'string' ){ t = JSON.parse( t ); }
              var newschema_data = t;
              resolve( { status: true, res_headers: res.headers, title: body.title, schema: newschema_data } );
            }
          }
        });
      }else{
        resolve( { status: false, error: 'not found for schema with title = "' + title + '".' } );
      }
    }else{
      resolve( { status: false, error: 'failed to get schemas.' } );
    }
  });
};

app.postData = async function( repo, title, token, data ){
  return new Promise( async function( resolve, reject ){
    repo = repo ? repo : GITHUB_REPO;
    var r0 = await app.getSchema( repo, title, token );
    if( r0 && r0.status && r0.schema ){
      var schema = r0.schema;

      var r1 = await app.getData( repo, title, token );
      if( r1 && r1.status && ( title in r1 ) && r1[title] ){
        var url = api_server_base + repo + '/issues/' + r1.number + '/comments';
        if( typeof data == 'object' ){
          data = JSON.stringify( data );
        }

        //. #5
        if( isDataValidSchema( data, schema.schema ) ){
          var options = {
            url: url,
            method: 'POST',
            json: { body: data },
            headers: { Accept: 'application/json', 'User-Agent': USER_AGENT }
          };
          if( token ){
            options.headers.Authorization = 'token ' + token;
          }
          request( options, ( err, res, body ) => {
            if( err ){
              console.log( { err } );
              resolve( { status: false, error: err } );
            }else{
              if( typeof body == 'string' ){
                body = JSON.parse( body );
              }
              //console.log( { body } );  //. ?????????????????????????????????????????? { "message": "API rate limit  exceeded for xx.xx.xx.xx. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)","documentation_url":"https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting" }
              if( body.message ){
                resolve( { status: false, error: body } );
              }else{
                var t = body.body;
                if( typeof t == 'string' ){ t = JSON.parse( t ); }
                var newdata = t;
                var r = { status: true, res_headers: res.headers, id: body.id, created: body.created_at, updated: body.updated_at, number: r1.number  };
                r[title] = newdata;
                resolve( r );
              }
            }
          });
        }else{
          resolve( { status: false, error: 'data is not valid for schema.' } );
        }
      }else{
        resolve( { status: false, error: 'failed to get data.' } );
      }
    }else{
      resolve( { status: false, error: 'not found for schema with title = "' + title + '".' } );
    }
  });
};

app.getData = async function( repo, title, token, limit, offset, keyword ){
  return new Promise( async function( resolve, reject ){
    repo = repo ? repo : GITHUB_REPO;
    var r1 = await app.getSchemas( repo, token );
    if( r1 && r1.status && r1.schemas ){
      var number = -1;
      for( var i = 0; i < r1.schemas.length && number == -1; i ++ ){
        if( title == r1.schemas[i].title ){
          number = r1.schemas[i].number;
        }
      }

      if( number > -1 ){
        var url = api_server_base + repo + '/issues/' + number + '/comments';

        var options = {
          url: url,
          method: 'GET',
          headers: { Accept: 'application/json', 'User-Agent': USER_AGENT }
        };
        if( token ){
          options.headers.Authorization = 'token ' + token;
        }
        request( options, ( err, res, body ) => {
          if( err ){
            console.log( { err } );
            resolve( { status: false, error: err } );
          }else{
            if( typeof body == 'string' ){
              body = JSON.parse( body );
            }
            //console.log( { body } );
            var newdata = [];
            for( var i = 0; i < body.length; i ++ ){
              var t = body[i].body;

              //. #13
              if( keyword ){
                if( typeof t == 'object' ){ t = JSON.stringify( t ); }
                if( t.indexOf( keyword ) > -1 ){
                  t = JSON.parse( t );
                  newdata.push( { id: body[i].id, created: body[i].created_at, updated: body[i].updated_at, data: t } );
                }
              }else{
                if( typeof t == 'string' ){ t = JSON.parse( t ); }
                newdata.push( { id: body[i].id, created: body[i].created_at, updated: body[i].updated_at, data: t } );
              }
            }

            //. ??????????????????????????????
            if( !offset ){ offset = 0; }
            if( limit ){
              newdata = newdata.slice( offset, offset + limit );
            }else{
              newdata = newdata.slice( offset )
            }

            var r = { status: true, res_headers: res.headers, number: number };
            r[title] = newdata;
            resolve( r );
          }
        });
      }else{
        resolve( { status: false, error: 'not found for schema with title = "' + title + '".' } );
      }
    }else{
      resolve( { status: false, error: 'failed to get schemas.' } );
    }
  });
};

app.putData = async function( repo, title, id, token, data ){
  return new Promise( async function( resolve, reject ){
    repo = repo ? repo : GITHUB_REPO;
    var r0 = await app.getSchema( repo, title, token );
    if( r0 && r0.status && r0.schema ){
      var schema = r0.schema;

      var r1 = await app.getData( repo, title, token );
      if( r1 && r1.status && ( title in r1 ) && r1[title] ){
        var _id = null;
        for( var i = 0; i < r1[title].length && _id == null; i ++ ){
          if( id == r1[title][i].id ){
            _id = r1[title][i].id;
          }
        }

        if( _id ){
          var url = api_server_base + repo + '/issues/comments/' + _id;
          if( typeof data == 'object' ){
            data = JSON.stringify( data );
          }

          if( isDataValidSchema( data, schema.schema ) ){
            var options = {
              url: url,
              method: 'PATCH',
              json: { body: data },
              headers: { Accept: 'application/json', 'User-Agent': USER_AGENT }
            };
            if( token ){
              options.headers.Authorization = 'token ' + token;
            }
            request( options, ( err, res, body ) => {
              if( err ){
                console.log( { err } );
                resolve( { status: false, error: err } );
              }else{
                if( typeof body == 'string' ){
                  body = JSON.parse( body );
                }
                //console.log( { body } );  //. ?????????????????????????????????????????? { "message": "API rate limit  exceeded for xx.xx.xx.xx. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)","documentation_url":"https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting" }
                if( body.message ){
                  resolve( { status: false, error: body } );
                }else{
                  var t = body.body;
                  if( typeof t == 'string' ){ t = JSON.parse( t ); }
                  var newdata = t;

                  var r = { status: true, res_headers: res.headers, id: body.id, created: body.created_at, updated: body.updated_at, number: r1.number };
                  r[title] = newdata;
                  resolve( r );
                }
              }
            });
          }else{
            resolve( { status: false, error: 'data is not valid for schema.' } );
          }
        }else{
          resolve( { status: false, error: 'not found for data with title = "' + title + '" and id = "' + id + '".' } );
        }
      }else{
        resolve( { status: false, error: 'failed to get data.' } );
      }
    }else{
      resolve( { status: false, error: 'not found for schema with title = "' + title + '".' } );
    }
  });
};

app.deleteData = async function( repo, title, id, token ){
  return new Promise( async function( resolve, reject ){
    repo = repo ? repo : GITHUB_REPO;
    var r0 = await app.getSchema( repo, title, token );
    if( r0 && r0.status && r0.schema ){
      //var schema = r0.schema;  //. deleteData ??? schema ?????????????????????
      var r1 = await app.getData( repo, title, token );
      if( r1 && r1.status && ( title in r1 ) && r1[title] ){
        var _id = null;
        for( var i = 0; i < r1[title].length && _id == null; i ++ ){
          if( id == r1[title][i].id ){
            _id = r1[title][i].id;
          }
        }

        if( _id ){
          var url = api_server_base + repo + '/issues/comments/' + _id;
          if( typeof data == 'object' ){
            data = JSON.stringify( data );
          }

          var options = {
            url: url,
            method: 'DELETE',
            headers: { Accept: 'application/json', 'User-Agent': USER_AGENT }
          };
          if( token ){
            options.headers.Authorization = 'token ' + token;
          }
          request( options, ( err, res, body ) => {
            if( err ){
              console.log( { err } );
              resolve( { status: false, error: err } );
            }else{
              resolve( { status: true, res_headers: res.headers, number: r1.number } );
            }
          });
        }else{
          resolve( { status: false, error: 'not found for data with title = "' + title + '" and id = "' + id + '".' } );
        }
      }else{
        resolve( { status: false, error: 'failed to get data.' } );
      }
    }else{
      resolve( { status: false, error: 'not found for schema with title = "' + title + '".' } );
    }
  });
};


var client_id = 'CLIENT_ID' in process.env ? process.env.CLIENT_ID : '';
var client_secret = 'CLIENT_SECRET' in process.env ? process.env.CLIENT_SECRET : '';
var callback_url = 'CALLBACK_URL' in process.env ? process.env.CALLBACK_URL : '';

app.get( '/login', function( req, res ){
  res.redirect( 'https://github.com/login/oauth/authorize?client_id=' + client_id + '&redirect_uri=' + callback_url + '&scope=repo' );
});

app.get( '/logout', function( req, res ){
  if( req.session.oauth ){
    req.session.oauth = {};
  }

  //. #8
  if( req.query.redirect ){
    res.redirect( req.query.redirect );
  }else{
    res.contentType( 'application/json; charset=utf-8' );
    res.write( JSON.stringify( { status: true, message: 'logged out' }, null, 2 ) );
    res.end();
  }
});

app.get( '/callback', function( req, res ){
  var code = req.query.code;
  var option = {
    url: 'https://github.com/login/oauth/access_token',
    form: { client_id: client_id, client_secret: client_secret, code: code, redirect_uri: callback_url },
    method: 'POST'
  };
  request( option, async function( err, res0, body ){
    if( err ){
      console.log( { err } );
    }else{
      var tmp1 = body.split( '&' );
      for( var i = 0; i < tmp1.length; i ++ ){
        var tmp2 = tmp1[i].split( '=' );
        if( tmp2.length == 2 && tmp2[0] == 'access_token' ){
          var access_token = tmp2[1];
          //console.log( 'access_token = ' + access_token );

          req.session.oauth = {};
          req.session.oauth.token = access_token;

          var r = await app.getMe( access_token );
          if( r && r.status && r.user ){
            req.session.oauth.id = r.user.id;
            req.session.oauth.avatar_url = r.user.avatar_url;
            req.session.oauth.name = r.user.name;
            req.session.oauth.email = r.user.email;
          }
        }
      }
    }

    //. #8
    if( req.query.redirect ){
      res.redirect( req.query.redirect );
    }else{
      res.contentType( 'application/json; charset=utf-8' );
      res.write( JSON.stringify( { status: true, session: req.session }, null, 2 ) );
      res.end();
    }
  });
});


app.get( '/', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  res.write( JSON.stringify( { status: true }, null, 2 ) );
  res.end();
});

app.get( '/items', function( req, res ){
  try{
    if( req.session && req.session.oauth && req.session.oauth.token ){ 
      console.log( req.session.oauth );
      res.render( 'items', { user: req.session.oauth, API_SERVER: '' } );
    }else{
      res.redirect( '/login' );
    }
  }catch( e ){
    console.log( e );
    res.render( 'items', { user: null, API_SERVER: '', error: e } );
  }finally{
  }
});

app.get( '/richitems', function( req, res ){
  try{
    if( req.session && req.session.oauth && req.session.oauth.token ){ 
      console.log( req.session.oauth );
      res.render( 'richitems', { user: req.session.oauth, API_SERVER: '' } );
    }else{
      res.redirect( '/login' );
    }
  }catch( e ){
    console.log( e );
    res.render( 'richitems', { user: null, API_SERVER: '', error: e } );
  }finally{
  }
});


//. Schemas API
app.post( '/api/schema/:title', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  if( req.headers['x-token'] || req.session && req.session.oauth ){
    var token = req.headers['x-token'] || req.session.oauth.token;
    var repo = req.query.repo;
    var title = req.params.title;
    if( title ){
      var schema_data = req.body;
      var r = await app.postSchema( repo, title, token, schema_data );
      if( r && r.status && r[title] ){
        res.write( JSON.stringify( r, null, 2 ) );
        res.end();
      }else{
        res.status( 400 );
        res.write( JSON.stringify( r, null, 2 ) );
        res.end();
      }
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: 'title needed.' }, null, 2 ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'need to authenticate first.' }, null, 2 ) );
    res.end();
  }
});

app.get( '/api/schema/:title', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  if( req.headers['x-token'] || req.session && req.session.oauth ){
    var token = req.headers['x-token'] || req.session.oauth.token;
    var repo = req.query.repo;
    var title = req.params.title;
    if( title ){
      var r = await app.getSchemas( repo, token );
      if( r && r.status && r[title] ){
        var schema = null;
        for( var i = 0; i < r[title].length && schema == null; i ++ ){
          if( r[title][i].title == title ){
            schema = r[title][i];
          }
        }

        if( schema ){
          var result = { status: true, res_headers: r.res_headers, schema: schema };
          res.write( JSON.stringify( result, null, 2 ) );
          res.end();
        }else{
          res.status( 400 );
          res.write( JSON.stringify( { status: false, error: 'no schema found for repo = "' + repo + '" and title = "' + title + '".' }, null, 2 ) );
          res.end();
        }
      }else{
        res.status( 400 );
        res.write( JSON.stringify( r, null, 2 ) );
        res.end();
      }
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: 'title needed.' }, null, 2 ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'need to authenticate first.' }, null, 2 ) );
    res.end();
  }
});

app.get( '/api/schemas', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  if( req.headers['x-token'] || req.session && req.session.oauth ){
    var token = req.headers['x-token'] || req.session.oauth.token;
    var repo = req.query.repo;

    var r = await app.getSchemas( repo, token );
    if( r && r.status && r.schemas ){
      res.write( JSON.stringify( { status: true, schemas: r.schemas }, null, 2 ) );
      res.end();
    }else{
      res.status( 400 );
      res.write( JSON.stringify( r, null, 2 ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'need to authenticate first.' }, null, 2 ) );
    res.end();
  }
});

app.put( '/api/schema/:title', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  if( req.headers['x-token'] || req.session && req.session.oauth ){
    var token = req.headers['x-token'] || req.session.oauth.token;
    var repo = req.query.repo;
    var title = req.params.title;
    if( title ){
      var schema_data = req.body;
      var r = await app.putSchema( repo, title, token, schema_data );
      if( r && r.status && r.schema ){
        res.write( JSON.stringify( { status: true, schema: r.schema }, null, 2 ) );
        res.end();
      }else{
        res.status( 400 );
        res.write( JSON.stringify( r, null, 2 ) );
        res.end();
      }
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: 'title needed.' }, null, 2 ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'need to authenticate first.' }, null, 2 ) );
    res.end();
  }
});

app.delete( '/api/schema/:title', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  if( req.headers['x-token'] || req.session && req.session.oauth ){
    var token = req.headers['x-token'] || req.session.oauth.token;
    var repo = req.query.repo;
    var title = req.params.title;
    if( title ){
      var r = await app.deleteSchema( repo, title, token );
      if( r && r.status && r.schema ){
        res.write( JSON.stringify( { status: true, schema: r.schema }, null, 2 ) );
        res.end();
      }else{
        res.status( 400 );
        res.write( JSON.stringify( r, null, 2 ) );
        res.end();
      }
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: 'title needed.' }, null, 2 ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'need to authenticate first.' }, null, 2 ) );
    res.end();
  }
});


//. Data API
app.post( '/api/data/:title', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  if( req.headers['x-token'] || req.session && req.session.oauth ){
    var token = req.headers['x-token'] || req.session.oauth.token;
    var repo = req.query.repo;
    var title = req.params.title;
    if( title ){
      var data = req.body;

      var r = await app.postData( repo, title, token, data );
      if( r && r.status && r[title] ){
        res.write( JSON.stringify( r, null, 2 ) );
        res.end();
      }else{
        res.status( 400 );
        res.write( JSON.stringify( r, null, 2 ) );
        res.end();
      }
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: 'title needed.' }, null, 2 ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'need to authenticate first.' }, null, 2 ) );
    res.end();
  }
});

app.get( '/api/data/:title/:id', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  if( req.headers['x-token'] || req.session && req.session.oauth ){
    var token = req.headers['x-token'] || req.session.oauth.token;
    var repo = req.query.repo;
    var title = req.params.title;
    var id = req.params.id;
    if( title && id ){
      var r = await app.getData( repo, title, token );
      if( r && r.status && r[title] ){
        var data = null;
        for( var i = 0; i < r[title].length && data == null; i ++ ){
          if( r[title][i].id == id ){
            data = r[title][i];
          }
        }

        if( data ){
          var result = { status: true, res_headers: r.res_headers };
          result[title] = data;
          res.write( JSON.stringify( result, null, 2 ) );
          res.end();
        }else{
          res.status( 400 );
          res.write( JSON.stringify( { status: false, error: 'no data found for repo = "' + repo + '", title = "' + title + '", and id = "' + id + '".' }, null, 2 ) );
          res.end();
        }
      }else{
        res.status( 400 );
        res.write( JSON.stringify( r, null, 2 ) );
        res.end();
      }
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: 'both title and id needed.' }, null, 2 ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'need to authenticate first.' }, null, 2 ) );
    res.end();
  }
});

app.get( '/api/data/:title', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  if( req.headers['x-token'] || req.session && req.session.oauth ){
    var token = req.headers['x-token'] || req.session.oauth.token;
    var repo = req.query.repo;
    var title = req.params.title;

    //. #13
    var limit = ( req.query.limit ? parseInt( req.query.limit ) : 0 );
    var offset = ( req.query.offset ? parseInt( req.query.offset ) : 0 );
    var keyword = ( req.query.keyword ? req.query.keyword : '' );
    if( title ){
      var r = await app.getData( repo, title, token, limit, offset, keyword );
      if( r && r.status && r[title] ){
        res.write( JSON.stringify( r, null, 2 ) );
        res.end();
      }else{
        res.status( 400 );
        res.write( JSON.stringify( r, null, 2 ) );
        res.end();
      }
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: 'title needed.' }, null, 2 ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'need to authenticate first.' }, null, 2 ) );
    res.end();
  }
});

app.put( '/api/data/:title/:id', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  if( req.headers['x-token'] || req.session && req.session.oauth ){
    var token = req.headers['x-token'] || req.session.oauth.token;
    var repo = req.query.repo;
    var title = req.params.title;
    var id = req.params.id;
    if( title && id ){
      var data = req.body;
      var r = await app.putData( repo, title, id, token, data );
      if( r && r.status && r[title] ){
        res.write( JSON.stringify( r, null, 2 ) );
        res.end();
      }else{
        res.status( 400 );
        res.write( JSON.stringify( r, null, 2 ) );
        res.end();
      }
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: 'both title and id needed.' }, null, 2 ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'need to authenticate first.' }, null, 2 ) );
    res.end();
  }
});

app.delete( '/api/data/:title/:id', async function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  if( req.headers['x-token'] || req.session && req.session.oauth ){
    var token = req.headers['x-token'] || req.session.oauth.token;
    var repo = req.query.repo;
    var title = req.params.title;
    var id = req.params.id;
    if( title && id ){
      var r = await app.deleteData( repo, title, id, token );
      if( r && r.status && r.data ){
        res.write( JSON.stringify( r, null, 2 ) );
        res.end();
      }else{
        res.status( 400 );
        res.write( JSON.stringify( r, null, 2 ) );
        res.end();
      }
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: 'both title and id needed.' }, null, 2 ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'need to authenticate first.' }, null, 2 ) );
    res.end();
  }
});

//. #5
function isDataValidSchema( data, schema ){
  var b = true;

  if( typeof data == 'string' ){ data = JSON.parse( data ); }
  if( typeof schema == 'string' ){ data = JSON.parse( schema ); }

  if( typeof data == 'object' && typeof schema == 'object' ){
    //. ???schema ????????????????????????????????????????????????????????????????????????
    //. ???data ???????????????????????????????????????????????????????????????
    //. schema ?????????????????????????????????????????????????????????????????????
    /*
      data = { "name": "string", "price": 100 },
      schema = { name: "string", price: "number" }
    */
    Object.keys( schema ).forEach( function( key ){
      //. schema ??????????????????????????????????????????????????????????????????????????????????????????????????????
      if( !( key in data ) ){
        b = false;
      }else if( schema[key] == 'richtext' || schema[key] == 'binary' ){
        //. data[key] = 'text/markdown | markdown';
        //.        or = 'image/png | base64';
        if( !( typeof data[key] == 'string' ) || data[key].split( ' | ' ).length < 2 ){
          b = false;
        }
      }else{
        if( !( typeof data[key] == schema[key] ) ){
          b = false;
        }
      }
    });
  }else{
    b = false;
  }

  return b;
}


var http_server = http.createServer( app );
var http_port = process.env.PORT || 8080;
http_server.listen( http_port );

if( options.key && options.cert && options.ca ){
  var https_server = https.createServer( options, app );
  var https_port = process.env.SSL_PORT || 8443;
  https_server.listen( https_port );
  console.log( "server starting on " + http_port + " / " + https_port + " ..." );
}else{
  console.log( "server starting on " + http_port + " ..." );
}

module.exports = app;
