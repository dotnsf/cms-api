//. cms-api.js
async function postSchema( schema_name, schema_data, redirect_url ){
  return new Promise( async function( resolve, reject ){
    $.ajax({
      type: 'POST',
      url: API_SERVER + '/api/schema/' + schema_name,
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify( schema_data ),
      success: function( result ){
        showRateLimitReset( result.res_headers );
        if( redirect_url ){
          window.location.href = redirect_url;
        }else{
          resolve( result );
        }
      },
      error: function( e0, e1, e2 ){
        console.log( e0, e1, e2 );
        if( redirect_url ){
          alert( e2 );
          window.location.href = redirect_url;
        }else{
          resolve( { status: false, error: e2, message: JSON.stringify( e0 ) } );
        }
      }
    });
  });
}

async function getSchema( schema, redirect_url ){
  return new Promise( async function( resolve, reject ){
    $.ajax({
      type: 'GET',
      url: API_SERVER + '/api/schema/' + schema,
      success: function( result ){
        showRateLimitReset( result.res_headers );

        if( redirect_url ){
          window.location.href = redirect_url;
        }else{
          resolve( result );
        }
      },
      error: function( e0, e1, e2 ){
        console.log( e0, e1, e2 );

        if( redirect_url ){
          window.location.href = redirect_url;
        }else{
          resolve( { status: false, error: e2, message: JSON.stringify( e0 ) } );
        }
      }
    });
  });
}

async function getSchemas( redirect_url ){
  return new Promise( async function( resolve, reject ){
    $.ajax({
      type: 'GET',
      url: API_SERVER + '/api/schemas',
      success: function( result ){
        showRateLimitReset( result.res_headers );

        if( redirect_url ){
          window.location.href = redirect_url;
        }else{
          resolve( result );
        }
      },
      error: function( e0, e1, e2 ){
        console.log( e0, e1, e2 );

        if( redirect_url ){
          window.location.href = redirect_url;
        }else{
          resolve( { status: false, error: e2, message: JSON.stringify( e0 ) } );
        }
      }
    });
  });
}

async function putSchema( schema, id, data, redirect_url ){
  return new Promise( async function( resolve, reject ){
    $.ajax({
      type: 'PUT',
      url: API_SERVER + '/api/schema/' + schema + '/' + id,
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify( data ),
      success: function( result ){
        showRateLimitReset( result.res_headers );
        if( redirect_url ){
          window.location.href = redirect_url;
        }else{
          resolve( result );
        }
      },
      error: function( e0, e1, e2 ){
        console.log( e0, e1, e2 );
        if( redirect_url ){
          alert( e2 );
          window.location.href = redirect_url;
        }else{
          resolve( { status: false, error: e2, message: JSON.stringify( e0 ) } );
        }
      }
    });
  });
}

async function deleteSchema( schema, redirect_url ){
  return new Promise( async function( resolve, reject ){
    if( confirm( schema + 'を削除します。よろしいですか？' ) ){
      $.ajax({
        type: 'DELETE',
        url: API_SERVER + '/api/schema/' + schema,
        success: function( result ){
          showRateLimitReset( result.res_headers );
          if( redirect_url ){
            window.location.href = redirect_url;
          }else{
            resolve( result );
          }
        },
        error: function( e0, e1, e2 ){
          console.log( e0, e1, e2 );
          if( redirect_url ){
            window.location.href = redirect_url;
          }else{
            resolve( { status: false, error: e2, message: JSON.stringify( e0 ) } );
          }
        }
      });
    }
  });
}

async function postData( schema, data, redirect_url ){
  return new Promise( async function( resolve, reject ){
    $.ajax({
      type: 'POST',
      url: API_SERVER + '/api/data/' + schema,
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify( data ),
      success: function( result ){
        showRateLimitReset( result.res_headers );
        if( redirect_url ){
          window.location.href = redirect_url;
        }else{
          resolve( result );
        }
      },
      error: function( e0, e1, e2 ){
        console.log( e0, e1, e2 );
        if( redirect_url ){
          alert( e2 );
          window.location.href = redirect_url;
        }else{
          resolve( { status: false, error: e2, message: JSON.stringify( e0 ) } );
        }
      }
    });
  });
}

async function getData( schema, redirect_url ){
  return new Promise( async function( resolve, reject ){
    $.ajax({
      type: 'GET',
      url: API_SERVER + '/api/data/' + schema,
      success: function( result ){
        showRateLimitReset( result.res_headers );

        if( redirect_url ){
          window.location.href = redirect_url;
        }else{
          resolve( result );
        }
      },
      error: function( e0, e1, e2 ){
        console.log( e0, e1, e2 );

        if( redirect_url ){
          window.location.href = redirect_url;
        }else{
          resolve( { status: false, error: e2, message: JSON.stringify( e0 ) } );
        }
      }
    });
  });
}

async function putData( schema, id, data, redirect_url ){
  return new Promise( async function( resolve, reject ){
    $.ajax({
      type: 'PUT',
      url: API_SERVER + '/api/data/' + schema + '/' + id,
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify( data ),
      success: function( result ){
        showRateLimitReset( result.res_headers );
        if( redirect_url ){
          window.location.href = redirect_url;
        }else{
          resolve( result );
        }
      },
      error: function( e0, e1, e2 ){
        console.log( e0, e1, e2 );
        if( redirect_url ){
          alert( e2 );
          window.location.href = redirect_url;
        }else{
          resolve( { status: false, error: e2, message: JSON.stringify( e0 ) } );
        }
      }
    });
  });
}

async function deleteData( schema, data_id, data_name, redirect_url ){
  return new Promise( async function( resolve, reject ){
    if( confirm( data_name + 'を削除します。よろしいですか？' ) ){
      $.ajax({
        type: 'DELETE',
        url: API_SERVER + '/api/data/' + schema + '/' + data_id,
        success: function( result ){
          showRateLimitReset( result.res_headers );
          if( redirect_url ){
            window.location.href = redirect_url;
          }else{
            resolve( result );
          }
        },
        error: function( e0, e1, e2 ){
          console.log( e0, e1, e2 );
          if( redirect_url ){
            window.location.href = redirect_url;
          }else{
            resolve( { status: false, error: e2, message: JSON.stringify( e0 ) } );
          }
        }
      });
    }
  });
}

function showRateLimitReset( headers ){
  if( headers && headers['x-ratelimit-reset'] ){
    var remain = headers['x-ratelimit-remaining'];
    if( typeof remain == 'string' ){ remain = parseInt( remain ); }
    var limit = headers['x-ratelimit-limit'];
    if( typeof limit == 'string' ){ limit = parseInt( limit ); }
    var used = parseInt( 100 * ( limit - remain ) / limit );

    var canvas = document.getElementById( 'mycanvas' );
    if( !canvas || !canvas.getContext ){
      return false;
    }
    var ctx = canvas.getContext( '2d' );

    //. 円を描画
    var r = 15;
    var x0 = 15, y0 = 15;

    var deg = ( remain / limit * 360 - 90 );
    console.log( 'remain = ' + remain + ', limit = ' + limit + ', deg = ' + deg );
    ctx.beginPath();
    ctx.arc( x0, y0, r, -90 * Math.PI / 180, deg * Math.PI / 180, false );
    ctx.lineTo( x0, y0 );

    var ratio = remain / limit;
    ctx.fillStyle = ( ratio >= 0.5 ? "rgba( 128, 255, 128, 0.8 )" : ( ratio >= 0.2 ? "rgba( 255, 255, 128, 0.8 )" : "rgba( 128, 128, 255, 0.8 )" ) );
    ctx.fill();

    ctx.font = '9px serif';
    ctx.fillStyle = '#fff';
    var fill_text = remain + '';
    var text_width = ctx.measureText( fill_text ).width;
    ctx.fillText( fill_text, ( 30 - text_width ) / 2, 20, 30 );
    
    var reset = headers['x-ratelimit-reset'];
    if( typeof reset == 'string' ){ reset = parseInt( reset ); }
    reset *= 1000;
    var ymdhns = getDateTime( reset ); 

    //$('#ratelimit-remaining').html( remaining );
    $('#ratelimit-reset').html( ymdhns );
    $('#canvas_wrap').prop( 'title', 'API 実行可能回数: ' + remain + '\n次回リセット: ' + ymdhns );
  }else{
    //$('#ratelimit-remaining').html( '--' );
    //$('#ratelimit-reset').html( '--' );
  }
}

function getDateTime( seed ){
  var t = ( seed ? new Date( seed ) : new Date() );

  var y = t.getFullYear();
  var m = t.getMonth() + 1;
  var d = t.getDate();
  var h = t.getHours();
  var n = t.getMinutes();
  var s = t.getSeconds();

  var ymdhns = y
    + '-' + ( m < 10 ? '0' : '' ) + m
    + '-' + ( d < 10 ? '0' : '' ) + d
    + ' ' + ( h < 10 ? '0' : '' ) + h
    + ':' + ( n < 10 ? '0' : '' ) + n
    + ':' + ( s < 10 ? '0' : '' ) + s;

  return ymdhns;
}

function apiLogin(){
  location.href = '/login';
}

function apiLogout( redirect_url ){
  if( confirm( "ログアウトしますか？" ) ){
    location.href = '/logout' + ( redirect_url ? '?redirect=' + redirect_url : '' );
  }
}

//. #10
function toRichText( content ){
  if( typeof content == 'string' ){
    return 'text/markdown \t ' + content;
  }else{
    return null;
  }
}

function fromRichText( richtext ){
  if( typeof richtext == 'string' ){
    var tmp = richtext.split( ' \t ' );
    if( tmp.length == 2 && tmp[0] == 'text/markdown' ){
      return tmp[1];
    }else{
      return null;
    }
  }else{
    return null;
  }
}

function toBinaryById( id ){
  var file = $('#'+id).files[0];
  var reader = new FileReader();
  reader.onload = function( evt ){
    var b64 = evt.currentTarget.result; //. 'data:image/png;base64,XXX'
    var tmp = b64.split( ',' );
    if( tmp.length == 2 ){
      var text = tmp[1];
      tmp = b64.split( ';' );
      if( tmp.length == 2 ){
        tmp = tmp[0].split( ':' );
        if( tmp.length == 2 ){
          var type = tmp[1];
          return ( type + ' \t ' + text );
        }else{
          return ( ' \t ' + text );
        }
      }else{
        return ( ' \t ' + text );
      }
    }else{
      return ( ' \t ' + b64 );
    }
  }
  reader.readAsDataURL( file );
}

function fromBinary( binary ){
  if( typeof binary == 'string' ){
    var tmp = richtext.split( ' \t ' );
    if( tmp.length == 2 ){
      var type = tmp[0];
      var b64text = tmp[1];
      return ( 'data:' + type + ';base64,' + b64text );
    }else{
      return null;
    }
  }else{
    return null;
  }
}
