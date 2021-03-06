# -*- coding: utf-8 -*-
require 'webrick'
require 'erb'    
require 'rubygems'
require 'dbi'

# Stringクラスのconcatメソッドを
# 置き換えるパッチ
class String
  alias_method(:orig_concat, :concat)
  def concat(value)
    if RUBY_VERSION > "1.9"
      orig_concat value.force_encoding('UTF-8')
    else
      orig_concat value
      end
  end
end

config = {
  :Port => 8099,
  :DocumentRoot => '.',
  }

# 拡張子erbのファイルをERBを呼び出して処理するERBHandlerと関連付ける
WEBrick::HTTPServlet::FileHandler.add_handler("erb", WEBrick::HTTPServlet::ERBHandler)

# WEBRickのHTTP Serverクラスのサーバーインスタンスを作成する
server = WEBrick::HTTPServer.new( config )

# erbのMIMEタイプを設定
server.config[:MimeTypes]["erb"] = "text/html"

# 一覧表示からの処理
# "http://localhost:8099/list" で呼び出される
server.mount_proc("/list") { |req, res|
  p req.query
  # queryによって表示するページの変更
  if !(defined? req.query)
    template = ERB.new( File.read('noselected.erb') )
  elsif !(defined? req.query['edit'])
    target_id = req.query['edit']
    template = ERB.new( File.read('edit.erb') )
  else
    id_array = []
    req.query.each { |name, val| 
        id_array.push("'" + val + "'")
    }
    id_array = id_array.join(" or id = ")    # 削除する配列の格納とsql用に改変
    template = ERB.new( File.read('delete.erb') )
  end
  res.body << template.result( binding )
}

# 登録の処理
# "http://localhost:8099/entry" で呼び出される
server.mount_proc("/entry") { |req, res|
  # （注意）本来ならここで入力データに危険や
  # 不正がないかチェックするが、演習の見通しのために割愛している
  p req.query
  #dbhを作成し、データベース'bookinfo_sqlite.db'に接続する
  dbh = DBI.connect( 'DBI:SQLite3:bookinfo_sqlite.db' )
  
  # idが使われていたら登録できないことにする
  rows = dbh.select_one("select * from bookinfos where id='#{req.query['id']}';")
  if rows then
    # データベースとの接続を終了する %>
    dbh.disconnect
    
    # 処理の結果を表示する
    # ERBを、ERBHandlerを経由せずに直接呼び出して利用している
    template = ERB.new( File.read('noentried.erb') )
    res.body << template.result( binding )
  else
    # テーブルにデータを追加する（長いので折り返している）
    dbh.do("insert into bookinfos \
      values('#{req.query['id']}','#{req.query['title']}',\
      '#{req.query['author']}','#{req.query['page']}',\
      '#{req.query['publish_date']}','#{req.query['image_url']}');")
    
    # データベースとの接続を終了する %>
    dbh.disconnect
    
    # 処理の結果を表示する
    # ERBを、ERBHandlerを経由せずに直接呼び出して利用している
    template = ERB.new( File.read('entried.erb') )
    res.body << template.result( binding )
  end
}

# 検索の処理
# "http://localhost:8099/retrieve" で呼び出される
server.mount_proc("/retrieve") { |req, res|
  # （注意）本来ならここで入力データに危険や
  # 不正がないかチェックするが、演習の見通しに割愛している
  p req.query
  
  # 検索条件の整理 
  a = ['id','title','author','page','publish_date']
  # 問い合わせ条件のある要素以外を削除
  a.delete_if {|name| req.query[name] == "" }

  if a.empty?
    where_data = ""
  else
    # 残った要素を検索条件文字列に変換
    a.map! {|name| "#{name} like '\%#{req.query[name]}\%'" }
    # 要素があるときは、where 句に直す
    #（現状、項目ごとの完全一致のorだけ）
    where_data = "where " +  a.join(' or ')   
  end
  
  # 処理の結果を表示する
  # ERBを、ERBHandlerを経由せずに直接呼び出して利用している
  template = ERB.new( File.read('retrieved.erb') )
  res.body << template.result( binding )

}

# 修正の処理
# "http://localhost:8099/edit" で呼び出される
server.mount_proc("/edit") { |req, res|
  # （注意）本来ならここで入力データに危険や
  # 不正がないかチェックするが、演習の見通しに割愛している
  p req.query # 引き渡されたリクエストの中のフォームデータを確認するためのデバッグ用
  #dbhを作成し、データベース'bookinfo_sqlite.db'に接続する
  dbh = DBI.connect( 'DBI:SQLite3:bookinfo_sqlite.db' )
  # テーブルのデータを更新する（長いので折り返している）
  dbh.do("update bookinfos set id='#{req.query['id']}',\
    title='#{req.query['title']}',author='#{req.query['author']}',\
    page='#{req.query['page']}',publish_date='#{req.query['publish_date']}'\
    where id='#{req.query['id']}';")
  # データベースとの接続を終了する %>
  dbh.disconnect
  # 処理の結果を表示する
  # ERBを、ERBHandlerを経由せずに直接呼び出して利用している
  template = ERB.new( File.read('edited.erb') )
  res.body << template.result( binding )
}

# 削除の処理
# "http://localhost:8099/delete" で呼び出される
server.mount_proc("/delete") { |req, res|
  # （注意）本来ならここで入力データに危険や
  # 不正がないかチェックするが、演習の見通しのために割愛している
  p req.query
  #dbhを作成し、データベース'bookinfo_sqlite.db'に接続する
  dbh = DBI.connect( 'DBI:SQLite3:bookinfo_sqlite.db' )
  
  rows = dbh.select_all("select * from bookinfos where id=#{req.query["id_array"]}")

  # テーブルからデータを削除する
  dbh.do("delete from bookinfos where id=#{req.query['id_array']};")
  
  # データベースとの接続を終了する
  dbh.disconnect
  
  # 処理の結果を表示する
  # ERBを、ERBHandlerを経由せずに直接呼び出して利用している
  template = ERB.new( File.read('deleted.erb') )
  res.body << template.result( binding )
}

# Ctrl-C割り込みがあった場合にサーバーを停止する処理を登録しておく
trap(:INT) do
  server.shutdown
end

# 上記記述の処理をこなすサーバーを開始する
server.start
