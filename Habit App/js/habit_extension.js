var sqliteDbSingleton = (function () {
    var instance;

    function init() {
        var db;
        console.log("init sqliteDbSingleton");
        return {
            openDb: function () {
                console.log("sqliteDbSingleton open database");
                var dbName = "Habits.sqlite";
                if (window.navigator.simulator === true) {
                    // For debugin in simulator fallback to native SQL Lite
                    console.log("Use built in SQL Lite");
                    db = window.openDatabase(dbName, "1.0", "Habits", 200000);
                } else {
                    db = window.sqlitePlugin.openDatabase(dbName);
                }
            },
            createTable: function () {
                console.log("sqliteDbSingleton create table");
                db.transaction(function (tx) {
                    tx.executeSql("CREATE TABLE IF NOT EXISTS checkins(ID TEXT primary key,USERID TEXT,HABITID TEXT,CONTENT TEXT,INSERTEDTIME TEXT)", [], function (tx, tr) {}, function (tx, e){console.log("Error: " + e.message);});
                    tx.executeSql("CREATE TABLE IF NOT EXISTS friends(ID TEXT primary key,USERA TEXT,USERB TEXT,STATUS TEXT)", [], function (tx, tr) {}, function (tx, e){console.log("Error: " + e.message);});
                    tx.executeSql("CREATE TABLE IF NOT EXISTS habits(ID TEXT primary key,USERID TEXT,CONTENT TEXT,PROGRESS INTEGER,FRIENDID TEXT,FRIENDPROGRESS INTEGER,LASTUPDATED TEXT,FRIENDLASTUPDATED TEXTT,APPROVED TEXT)", [], function (tx, tr) {}, function (tx, e){console.log("Error: " + e.message);});
                    tx.executeSql("CREATE TABLE IF NOT EXISTS users(ID TEXT primary key,EMAIL TEXT,USERNAME TEXT,PASSWORD TEXT,STATUS TEXT)", [], function (tx, tr) {}, function (tx, e){console.log("Error: " + e.message);});
                });
            },
            dropTable: function () {
                console.log("sqliteDbSingleton drop table");
                db.transaction(function (tx) {
                    tx.executeSql("drop table checkins", [], function (tx, tr) {}, function (tx, e){console.log("Error: " + e.message);});
                    tx.executeSql("drop table friends", [], function (tx, tr) {}, function (tx, e){console.log("Error: " + e.message);});
                    tx.executeSql("drop table habits", [], function (tx, tr) {}, function (tx, e){console.log("Error: " + e.message);});
                    tx.executeSql("drop table users", [], function (tx, tr) {}, function (tx, e){console.log("Error: " + e.message);});
                });
            },
            getDbconnection: function(){
                return db;
            }
        };
    };
    return {
        getInstance: function () {
            if (!instance) {
                instance = init();
            }
            return instance;
        }
    };
})();