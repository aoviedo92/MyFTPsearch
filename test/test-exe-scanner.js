//var childProcess = require('child_process');
//var exec = require('child_process').execFile;
//var fun =function(){
//    console.log("fun() start");
//    exec(exe, function(err, data) {
//        console.log(err)
//        console.log(data.toString());
//    });
//}
//fun();
var file = "ftpIndexService.exe";
var args = ["eureka", "192.168.137.1", "anonymous", "", ""];
var execFile = require('child_process').execFile;
var child = execFile(file, args, function (error, stdout, stderr) {
    if (error) {
        //throw error;
        console.log(error);
    }
    console.log(stdout);
});
