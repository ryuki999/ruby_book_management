var data;

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

$(function () {
  $('#search_button').click(function () {
    const img_list = document.getElementById('book_list');
    while (img_list.firstChild) {
      img_list.removeChild(img_list.firstChild);
    }
    const isbn = $('#search_keyword').val();
    const max_results = 40;
    var index = '';
    const count = 1;
    for (var i = 0; i < count; i++) {
      index = i * max_results;
      const url =
        'https://www.googleapis.com/books/v1/volumes?q=' +
        isbn +
        '&maxResults=' +
        max_results +
        '&startIndex=' +
        index;
      console.log(isbn);
      $.getJSON(url, function (base_data) {
        data = base_data;
        console.log(data.items.length);
        if (!data.totalItems) {
          console.log(data);
          $('#book_list').html(
            '<p class="bg-warning" id="warning">該当する書籍がありません。</p>'
          );
          $('#book_list > p').fadeOut(3000);
        } else {
          for (var i = 0; i < data.items.length; i++) {
            const div = document.createElement('div');
            div.className = 'col-2 mb-4';

            const img = document.createElement('img');
            img.id = data.items[i].id;
            img.height = '200';
            img.width = '150';
            img.className = 'img-thumbnail';

            const span = document.createElement('span');
            span.textContent = data.items[i].volumeInfo.title;

            if (
              data.items[i].volumeInfo !== undefined &&
              data.items[i].volumeInfo.imageLinks !== undefined &&
              data.items[i].volumeInfo.imageLinks.smallThumbnail !== undefined
            ) {
              img.src = data.items[i].volumeInfo.imageLinks.smallThumbnail;
              console.log('a');
            } else {
              img.src = './image/no-image-icon.png';
              console.log('b');
            }
            $(div).append(img);
            $(div).append(span);
            $('.row').append(div);
          }
        }
      });
    }
  });
});