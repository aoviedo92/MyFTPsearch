scannedDir = [
    {
        url: "/",
        files: ["fil1","fil2"],
        name: ""
    },
    {
        url: "/dir1",
        files: ["fil1-dr1","fil2-dir1"],
        name: "dir1"
    },
    {
        url: "/dir1/sub1",
        files: ["fil1-sub1","fil2-sun1"],
        name: "sub1"
    },
    {
        url: "/dir1/sub1/fil1",
        files: [],
        name: "fil1"
    }
];
var searchKey = 'fil1';
var findDirToo = true;
var matchD = [];
var matchF = [];
scannedDir.forEach(function (dir) {
    //console.log(dir)
    if (findDirToo) {
        if (dir.name == searchKey) {//todo usar expresion reg
            matchD.push({
                url: dir.url,
                name: dir.name
            })
        }
    }
    dir.files.forEach(function (file) {
        if (file == searchKey)//todo usar expresion reg
        //console.log("file:", file)
            matchF.push({
                url: dir.url + "/" + file,//todo usar alguna func path
                name: file
            })
    })
});
