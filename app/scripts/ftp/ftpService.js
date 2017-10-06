(function () {
    'use strict';
    var util = require('util');
    var homedir = require('os').homedir();
    var json_data = null;
    var fs = require('fs');
    var file = homedir + '\\myftpsearch_data.json';

    console.log(__dirname);

    angular.module('app')
        .service('ftpService', ['$q', ftpService]);

    function ftpService($q) {
        return {
            getAllFtp: getAllFtp,
            destroy: deleteFtp,
            save: saveFtp
        };

        function getAllFtp() {
            try {
                var str_data = fs.readFileSync(file, 'utf-8');
                json_data = JSON.parse(str_data);
            } catch (err) {
                fs.writeFile(file, '[]', function (err) {
                    if (err) console.log(err);
                    console.log("archivo creado.");
                    json_data = []
                });
            }
            var deferred = $q.defer();
            deferred.resolve(json_data);
            return deferred.promise;
        }

        function deleteFtp(ftp) {
            var deferred = $q.defer();
            //json_data.forEach(function (ftp, index) {//buscar si ya esta
            //    if (ftp.server_name == ftp_server_name) {
            //        json_data.splice(index, 1);
            //    }
            //});
            var idx = json_data.indexOfByProperty(ftp, 'server_name');
            if (idx > -1)json_data.splice(idx, 1);
            fs.writeFile(file, JSON.stringify(json_data), function (err) {
                var msg = "";
                if (err) {
                    console.log(err);
                    msg = "Error " + err;
                } else {
                    console.log("archivo guardado..");
                    msg = util.format("Éxito al eliminar el servidor: " + ftp.server_name);
                }
                deferred.resolve(msg)
            });
            return deferred.promise;
        }

        function saveFtp(new_ftp_data) {
            //salvar o actualizar un servidor.
            var deferred = $q.defer();
            var ftp_updated = false;
            var idx = json_data.indexOfByProperty(new_ftp_data, 'server_name');
            if (idx > -1)json_data[idx] = new_ftp_data;//actualizar
            else json_data.push(new_ftp_data);//crear
            fs.writeFile(file, JSON.stringify(json_data), function (err) {
                var msg = "";
                if (err) {
                    console.log(err);
                    msg = "Error " + err;
                } else {
                    console.log("archivo guardado..");
                    msg = util.format("Éxito al %s los datos.", idx > -1 ? "actualizar" : "crear");
                }
                deferred.resolve(msg)
            });
            return deferred.promise;
        }
    }
})();
