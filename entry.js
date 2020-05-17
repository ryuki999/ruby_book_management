var data;

// GETパラメータを蔵書登録フォームに書く関数
function query_display() {
  var queryString = window.location.search;
  var queryObject = new Object();
  if (queryString) {
    queryString = queryString.substring(1);
    var parameters = queryString.split('&');

    for (var i = 0; i < parameters.length; i++) {
      var element = parameters[i].split('=');

      var paramName = decodeURIComponent(element[0]);
      var paramValue = decodeURIComponent(element[1]);

      queryObject[paramName] = paramValue;
    }
  }
  $('#title').val(queryObject['title']);
  $('#author').val(queryObject['author']);
  $('#page').val(queryObject['page']);
  $('#publish_date').val(queryObject['publish_date']);
  if (queryObject['image_url'] !== undefined) {
    $('#image').attr('src', queryObject['image_url']);
    $('#image_url').val(queryObject['image_url']);
  } else {
    $('#image').attr('src', './image/no-image-icon.png');
    $('#image_url').val('./image/no-image-icon.png');
  }
}
