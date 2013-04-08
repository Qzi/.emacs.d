/**
 * Created with JetBrains WebStorm.
 * User: hanqingnan
 * Date: 13-2-1
 * Time: 上午7:40
 * To change this template use File | Settings | File Templates.
 */

var cluster = require("cluster");
var os =  require("os");
var http = require("http");

var  CPUs = os.cpus();

//console.log("cpus : "+CPUs.length);

//console.log("isMaster : "+cluster.isMaster);

if(cluster.isMaster){
    console.log(".....");

    var timeouts=[];

    function errorMsg(){
        console.error("Something must be wrong with the connection...");
    }
    cluster.on("exit", function(worker, code, signal){
        clearTimeout(timeouts[worker.id]);
        console.log("worker "+worker.process.pid+ " died");
    });

    cluster.on("fork", function(worker){
        timeouts[worker.id] = setTimeout(errorMsg,2000);
        console.log(worker.process.pid+ " fork");

    });

    cluster.on("listening", function(worker, address){
        clearTimeout(timeouts[worker.id]);
    });

    cluster.on("disconnect", function(worker){
        console.log("disconnect"+worker.id);
    });

    cluster.on("setup", function(worker){
        console.log("setup");
    });

    process.on("exit", function () {
        console.log("exit app ...");
    });


    for(var i=0;i<CPUs.length;i++){
        cluster.fork();
    }
    console.log(cluster.settings);
    console.log(process.env.NODE_UNIQUE_ID);
    console.log(cluster.isWorker);
}else{

    http.createServer(function(req, res){
        res.writeHead(200);
        res.end("hello world\n");
    }).listen(8000);
    console.log(cluster.isWorker);// is true child process
    console.log("child_process "+ process.pid+" http startd ");
}

