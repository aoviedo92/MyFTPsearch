var jsftp = require("jsftp");
var data = {
    //host: "ucistore.uci.cu",
    host: "192.168.137.1",
    user: "",
    pass: "",
    scanDir: "."
};
var scanResult = [];
var _scanFTP = function (data) {
    var scanDirs = [];//urls a escanear ['/', '/folder1', '/folder1/sub'...]
    scanDirs.push(data.scanDir);
    var ftp = new jsftp({
        host: data.host
    });
    var listCurrentUrl = function () {
        if (scanDirs.length){
            var currentUrl = scanDirs.shift();
            console.log(currentUrl)
            ftp.ls(currentUrl, function (err, res) {
                console.log(err)
                if (typeof res != "undefined" && err==null) {
                    var scannedDir = {url: currentUrl, files: [], name: currentUrl};
                    res.forEach(function (file) {
                        console.log(file)
                        if (file.type === 1) {//dir
                            var dirUrl = currentUrl + "/" + file.name;
                            scanDirs.push(dirUrl);
                        }
                        if (file.type === 0) {//file
                            scannedDir.files.push(file.name)
                        }
                    });
                    scanResult.push(scannedDir)
                    console.log('scanDir',scanDirs)
                }
                listCurrentUrl();
            })
        }else {
            console.log('6-',scanResult)
        }
    };
    listCurrentUrl();
};
scanFTP(data);
