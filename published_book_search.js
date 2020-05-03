var data;

// 出版本検索用関数
$(function () {
  const max_results = 40;
  const page_index = 12;
  const query_num = 1;
  var pagination_num = 1;

  // 画像区画を生成する関数
  function image_list_dom(data_item) {
    const div = document.createElement('div');
    div.className = 'col-2 mb-4';

    const img = document.createElement('img');
    img.id = data_item.id;
    img.height = '150';
    img.width = '150';
    img.className = 'img-thumbnail';

    const span = document.createElement('span');
    span.textContent = data_item.volumeInfo.title;

    if (
      data_item.volumeInfo !== undefined &&
      data_item.volumeInfo.imageLinks !== undefined &&
      data_item.volumeInfo.imageLinks.smallThumbnail !== undefined
    ) {
      img.src = data_item.volumeInfo.imageLinks.smallThumbnail;
    } else {
      img.src = './image/no-image-icon.png';
    }
    $(div).append(img);
    $(div).append('<br>');
    $(div).append(span);
    $('.row').append(div);
  }

  //ページネーションを生成する関数
  function pagination_dom(pagination_num = 1) {
    var count = 1;
    console.log(pagination_num);
    const li = document.createElement('li');
    li.className = 'page-item';

    const span = document.createElement('span');
    span.className = 'page-link';
    span.textContent = 'prev';

    li.append(span);
    $('.pagination').append(li);

    for (var j = 0; j < data.items.length; j++) {
      if (j % page_index === 0) {
        const li = document.createElement('li');
        if (pagination_num == count) {
          li.className = 'page-item active';
        } else {
          li.className = 'page-item';
        }

        const span = document.createElement('span');
        span.className = 'page-link';
        span.textContent = count;

        li.append(span);
        $('.pagination').append(li);
        count++;
      }
    }

    const li2 = document.createElement('li');
    li2.className = 'page-item';

    const span2 = document.createElement('span');
    span2.className = 'page-link';
    span2.textContent = 'next';

    li2.append(span2);
    $('.pagination').append(li2);
  }

  //DOM要素の削除
  function delete_dom() {
    // 本リストの削除
    const img_list = document.getElementById('book_list');
    while (img_list.firstChild) {
      img_list.removeChild(img_list.firstChild);
    }
    // ページネーションの削除
    const pagination = document.getElementById('page');
    while (pagination.firstChild) {
      pagination.removeChild(pagination.firstChild);
    }
  }

  // 検索ボタンが押されたときに本リストとページャを表示
  $('#search_button').click(function () {
    delete_dom();
    const isbn = $('#search_keyword').val();
    var index = 0;

    for (var i = 0; i < query_num; i++) {
      index = i * max_results;
      const url =
        'https://www.googleapis.com/books/v1/volumes?q=' +
        isbn +
        '&maxResults=' +
        max_results +
        '&startIndex=' +
        index;
      $.getJSON(url, function (base_data) {
        data = base_data;
        if (!data.totalItems) {
          $('#book_list').html(
            '<p class="bg-warning" id="warning">該当する書籍がありません。</p>'
          );
        } else {
          for (var i = 0; i < data.items.length; i++) {
            if (i < page_index) {
              image_list_dom(data.items[i]);
            } else {
              break;
            }
          }
        }
        pagination_dom();
      });
    }
  });

  $(document).on('click', '.page-link', function () {
    // ページネーションのliのクリックを感知して、その番号を取得、
    // それに応じて一定数をdataから取得する
    // 本リストの削除
    if ($(this).text() === 'prev' && pagination_num > 1) {
      pagination_num--;
    } else if ($(this).text() === 'next' && pagination_num < 4) {
      pagination_num++;
    } else {
      if ($(this).text() !== 'prev' && $(this).text() !== 'next') {
        pagination_num = $(this).text();
      }
    }
    delete_dom();
    const pre_index = (pagination_num - 1) * page_index;
    const last_index = pagination_num * page_index;
    for (var i = 0; i < data.items.length; i++) {
      if (pre_index <= i && last_index > i) {
        // modal_book_info(data.items[i]);
        image_list_dom(data.items[i]);
      }
    }
    pagination_dom(pagination_num);
  });

  $(document).on('click', '.img-thumbnail', function () {
    /* イベント発火時の処理 */
    const id = this.id;
    console.log(id);

    for (var i = 0; i < data.items.length; i++) {
      if (data.items[i].id === id) {
        // 該当書籍が存在した場合、JSONから値を取得して入力項目のデータを取得する
        console.log(id);
        url = 'entry.erb?';
        if (data.items[i].volumeInfo !== undefined) {
          if (data.items[i].volumeInfo.title !== undefined) {
            url +=
              'title=' + encodeURIComponent(data.items[i].volumeInfo.title);
          }
          if (data.items[i].volumeInfo.authors !== undefined) {
            url +=
              '&author=' +
              encodeURIComponent(data.items[i].volumeInfo.authors[0]);
          }
          if (data.items[i].volumeInfo.pageCount !== undefined) {
            url +=
              '&page=' + encodeURIComponent(data.items[i].volumeInfo.pageCount);
          }
          if (data.items[i].volumeInfo.publishedDate !== undefined) {
            url +=
              '&publish_date=' +
              encodeURIComponent(data.items[i].volumeInfo.publishedDate);
          }
          if (
            data.items[i].volumeInfo.imageLinks !== undefined &&
            data.items[i].volumeInfo.imageLinks.smallThumbnail !== undefined
          ) {
            url +=
              '&image_url=' +
              encodeURIComponent(
                data.items[i].volumeInfo.imageLinks.smallThumbnail
              );
          } else {
            url += '&image_url=' + './image/no-image-icon.png';
          }
        }
        location.href = url;
      }
    }
  });
});
