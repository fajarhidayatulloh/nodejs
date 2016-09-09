const port=8000;
var http=require("http");
var url=require("url");
var qString=require("querystring");
var router=require("routes")();
var view=require("swig");
var mysql=require("mysql");
var connection=mysql.createConnection({
	host:"localhost",
	user:"root",
	password:"",
	port:3306,
	database:"nodejs"
});


router.addRoute('/',function(req,res){
	var html=view.compileFile('index.html')(
		{
			title:"Halaman Utama"
		}
	);
	res.writeHead(200,{"Content-Type":"text/html"});
	res.end(html);
});

router.addRoute('/input',function(req,res){
	if(req.method.toUpperCase()=="POST"){
		var data_post="";
		req.on('data',function(chuncks){
			data_post+=chuncks;
		});
		req.on('end', function(){
			data_post=qString.parse(data_post);
			connection.query("INSERT INTO mahasiswa set?", data_post, 
				function(err,field){
					if(err) throw err;
					res.writeHead(302,{"Location":"/data"});
					res.end(field.affectedRows+" Data Berhasil Di Input");
				}
			);
		});
	}else{
		var html=view.compileFile('input.html')(
			{
				title:"Input Data Mahasiswa"
			}
		);
		res.writeHead(200,{"Content-Type":"text/html"});
		res.end(html);
	}
});

router.addRoute('/data',function(req,res){
	connection.query("SELECT * FROM mahasiswa", function(err,rows,field){
		if(err) throw err;
		var html=view.compileFile('data.html')(
			{
				title:"Data Mahasiswa Kampus NodeJs",
				data:rows
			}
		);
		res.writeHead(200,{"Content-Type":"text/html"});
		res.end(html);
	});
});

router.addRoute('/update/:npm', function(req,res){
	
	connection.query("SELECT * FROM mahasiswa where ?",
		{npm:this.params.npm},
		function(err,rows,field){
			if(rows.length){
				var data=rows[0];
				if(req.method.toUpperCase()=="POST"){
					var data_post="";
					req.on('data',function(chuncks){
						data_post+=chuncks;
					});
					req.on('end', function(){
						data_post=qString.parse(data_post);
						connection.query("UPDATE mahasiswa SET ? WHERE ?",
							[ 
								data_post,
								{
									npm:data.npm
								}
							], 
							function(err,field){
								if(err) throw err;
								res.writeHead(302,{"Location":"/data"});
								res.end(field.affectedRows+" Data Berhasil di Update");
							}
						);
					});
				}else{
					var html=view.compileFile('edit.html')(
						{
							title:"Edit Data Mahasiswa Kampus NodeJs",
							data:data
						}
					);
					res.writeHead(200,{"Content-Type":"text/html"});
					res.end(html);
				}
			}else{
				var html=view.compileFile("404.html")();
				res.writeHead(404,{"Content-Type":"text/html"});
				res.end(html);
			}
		}
	);		
});


router.addRoute('/delete/:npm', function(req,res){

	connection.query("DELETE FROM mahasiswa WHERE ?",
		{
			npm:this.params.npm
		},

		function(err,field){
			if(err) throw err;
				res.writeHead(302,{"Location":"/data"});
				res.end();
		}
	);
});

http.createServer(function(req,res){
	var path=url.parse(req.url).pathname;
	var match=router.match(path);
	if(match){
		match.fn(req,res);
	}else{
		var html=view.compileFile("404.html")();
		res.writeHead(404,{"Content-Type":"text/html"});
		res.end(html);
	}
	
}).listen(port);
console.log("Server is running http://localhost:"+port);
