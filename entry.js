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
  $('#image').attr('src', queryObject['image_url']);
}

$(document).on('click', '.img-thumbnail', function () {
  // data = $('#data_hidden').val();
  console.log(data);
  /* イベント発火時の処理 */
  const id = this.id;
  console.log(id);
  for (var i = 0; i < data.items.length; i++) {
    if (data.items[i].id === id) {
      // 該当書籍が存在した場合、JSONから値を取得して入力項目のデータを取得する
      console.log(id);
      $('#title').val(data.items[i].volumeInfo.title);
      $('#author').val(data.items[i].volumeInfo.authors[0]);
      $('#page').val(data.items[i].volumeInfo.pageCount);
      $('#publish_date').val(data.items[i].volumeInfo.publishedDate);
      if (
        data.items[i].volumeInfo !== undefined &&
        data.items[i].volumeInfo.imageLinks !== undefined &&
        data.items[i].volumeInfo.imageLinks.smallThumbnail !== undefined
      ) {
        $('#image_url').val(data.items[i].volumeInfo.imageLinks.smallThumbnail);
      } else {
        $('#image_url').val('./image/no-image-icon.png');
      }
    }
  }
});
