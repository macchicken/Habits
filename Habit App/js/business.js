var habitsPool = (function () {
    var instance;

    function init() {
        console.log("init habitsPool");
        return {
            loadHabits: function (currentUser,db) {
                console.log("habitsPool loadHabits");
                db.transaction(function (tx) {
                    tx.executeSql("SELECT h.id ID, h.userId USERID, h.content CONTENT, h.progress PROGRESS, h.friendId FRIENDID, h.friendProgress FRIENDPROGRESS, h.lastUpdated LASTUPDATED, h.approved APPROVED, u.username USERNAME FROM habits h LEFT JOIN users u ON u.ID = h.FRIENDID WHERE ? IN (h.USERID, h.FRIENDID) AND h.APPROVED = ? ORDER BY h.ID DESC", [currentUser.ID,"TRUE"], function (tx, rs) {
                        var habits=[];
                        $("#habits-container").html("");
                        $("#navbar-username").html(currentUser.USERNAME+"<span class='caret'></span>");
                        for (var i = 0; i < rs.rows.length; i++) {
                            habits.push(rs.rows.item(i));
                        }
                        console.log(habits);
                        for (var i=0;i<habits.length;i++){
                            if (habits[i].APPROVED=="TRUE"){
                                $("#habits-container").append('<a href="#" class="list-group-item" onclick="checkin(\''+habits[i].ID+'\')">'+habits[i].CONTENT);
                                if (habits[i].PROGRESS*1==21){
                                    $("#habits-container").append("<span class='label label-success pull-right'>第三阶段</span>");
                                }else if (habits[i].PROGRESS*1>=7){
                                    $("#habits-container").append("<span class='label label-success pull-right'>第二阶段</span>");
                                }else{
                                    $("#habits-container").append("<span class='label label-success pull-right'>第一阶段</span>");
                                }
                                if (habits[i].USERID==habits[i].FRIENDID){
                                    if (habits[i].PROGRESS*1!=21){
                                        var tp=(habits[i].PROGRESS*1/21)*100;
                                        $("#habits-container").append("<div class='progress'><div class='progress-bar progress-bar-striped progress-bar-info' role='progressbar' aria-valuenow='"+ habits[i].PROGRESS+"' aria-valuemin='0' aria-valuemax='21' style='width:"+tp.toString()+"%' id='progress-"+habits[i].ID+"'></div></div>");
                                    }else{
                                        $("#habits-container").append("");
                                    }
                                }else{
                                    if (habits[i].PROGRESS*1!=21){
                                        var tp=(habits[i].PROGRESS*1/21)*100;
                                        $("#habits-container").append("<div class='progress'><div class='progress-bar progress-bar-striped progress-bar-info' role='progressbar' aria-valuenow='"+ habits[i].PROGRESS+"' aria-valuemin='0' aria-valuemax='21' style='width:"+tp.toString()+"%' id='progress-"+habits[i].ID+"'></div></div>");
                                    }else{
                                        $("#habits-container").append("");
                                    }
                                    if (habits[i].FRIENDPROGRESS*1!=21){
                                        var tp=(habits[i].FRIENDPROGRESS*1/21)*100;
                                        $("#habits-container").append("<div class='progress'><div class='progress-bar progress-bar-striped progress-bar-info' role='progressbar' aria-valuenow='"+ habits[i].FRIENDPROGRESS+"' aria-valuemin='0' aria-valuemax='21' style='width:"+tp.toString()+"%' id='progress-"+habits[i].ID+"'></div></div>");
                                    }else{
                                        $("#habits-container").append("");
                                    }
                                }
                            }else{
                                $("#habits-container").append("<a href='#' class='list-group-item list-group-item-warning'>You want to develop a habit (<b>"+habits[i].CONTENT+"</b>) with "+currentUser.USERNAME+"<b><i>"+"</i></b></a>");
                            }
                        }
                        $("#signup").css("display","none");
                        $("#index").css("display","none");
                        $("#homeview").css("display","block");
                        $("#navigationbarview").css("display","block");
                    },function (tx, e){console.log("Error: " + e.message);});
                });
            },
            saveHabit: function (currentUser,habitData,sqliteDb,succcessCallback){
                console.log("habitsPool saveHabit");
                console.log(habitData);
                sqliteDb.transaction(function (tx) {
                    var habitId=UUID.genV1().toString().split('-').join('');
                    if (currentUser.ID==habitData.friendId||habitData.friendId==null||habitData.friendId==undefined){
                            tx.executeSql("INSERT INTO habits(ID,USERID,CONTENT,PROGRESS,FRIENDID,FRIENDPROGRESS,LASTUPDATED,FRIENDLASTUPDATED,APPROVED) VALUES(?,?,?,?,?,?,?,?,?)",[habitId,currentUser.ID,habitData.content,1,currentUser.ID,1,"","","TRUE"],function (tx, r) {
                            succcessCallback(habitId+':'+habitData.content+':'+'1');
                        }, function (tx, e){console.log("Error: " + e.message);});
                    }else{
                        tx.executeSql("INSERT INTO habits(ID,USERID,CONTENT,PROGRESS,FRIENDID,FRIENDPROGRESS,LASTUPDATED,FRIENDLASTUPDATED,APPROVED) VALUES(?,?,?,?,?,?,?,?,?)",[habitId,currentUser.ID,habitData.content,1,habitData.friendId,0,"","","FALSE"],function (tx, r) {
                            succcessCallback(habitId+':'+habitData.content+':'+'1');
                        }, function (tx, e){console.log("Error: " + e.message);});
                    }
               });
            },
            loadhabitrequests: function(currentUser,db,succcessCallback){
                console.log("habitsPool loadhabitrequests");
                db.transaction(function (tx) {
                    tx.executeSql("SELECT h.id ID, h.content CONTENT, u.username USERNAME FROM habits h LEFT JOIN users u ON u.id = h.userId WHERE h.friendId = ? AND h.approved = ? ORDER BY h.id DESC",[currentUser.ID,"FALSE"],function (tx, rs) {
                        var len=rs.rows.length;
                        console.log(len);
                        var detailHabits="";
                        if (len>0){
                            for (var i=0;i<len;i++){
                                detailHabits=detailHabits+rs.rows.item(i).ID+':'+rs.rows.item(i).CONTENT+':'+rs.rows.item(i).USERNAME+'=';
                            }
                        }
                        var resultData={"status":"success","content":detailHabits};
                        succcessCallback(resultData);
                    },function (tx, e){ var resultData={"status":"fail","content":e.message};succcessCallback(resultData);console.log("Error: " + e.message);});
                });
            },
            respondtohabit: function(currentUser,dataJson,db,succcessCallback){
                console.log("habitsPool respondtohabit");
                console.log(dataJson);
                if (dataJson.approved==true){
                    db.transaction(function (tx) {
                        tx.executeSql("UPDATE habits SET APPROVED = ?, FRIENDPROGRESS = ? WHERE ID = ? AND FRIENDID = ?",["TRUE",1,dataJson.id,currentUser.ID],function (tx, rs){
                            succcessCallback();
                        },function (tx, e){console.log("Error: " + e.message);});
                    });
                }else{
                     db.transaction(function (tx) {
                        tx.executeSql("UPDATE habits SET APPROVED = ?, FRIENDID = USERID , FRIENDPROGRESS = ? , FRIENDLASTUPDATED = LASTUPDATED WHERE ID = ? AND FRIENDID = ?",["TRUE",1,dataJson.id,currentUser.ID],function (tx, rs){
                            succcessCallback();
                        },function (tx, e){console.log("Error: " + e.message);});
                     });
                }
            },
            checkin: function(currentUser,dataJson,db,succcessCallback){
                console.log("habitsPool checkin");
                console.log(dataJson);
                db.transaction(function (tx) {
                     tx.executeSql("SELECT ID, USERID, PROGRESS, LASTUPDATED, FRIENDID, FRIENDPROGRESS, FRIENDLASTUPDATED FROM habits WHERE ID = ? AND (USERID = ? OR FRIENDID = ?)",[dataJson.id,currentUser.ID,currentUser.ID],function (tx, rs){
                         if (rs.rows.length==1){
                             if (rs.rows.item(0).PROGRESS=="21"){
                                 var resultData={"status":"fail","content":"Already Completed"};
                                 succcessCallback(resultData);
                             }else{
                                 if (rs.rows.item(0).USERID==currentUser.ID){
                                     var ele1=dataJson.lastUpdated.split(" ")[0];
                                     var ele2=rs.rows.item(0).LASTUPDATED.split(" ")[0];
                                     if (ele1!==ele2){
                                         var statement="UPDATE habits SET PROGRESS = PROGRESS + 1, LASTUPDATED = ? WHERE ID = ? AND USERID = ?";
                                         app.getHabitsp().checkinInner(statement,currentUser,dataJson,app.getSqliteDb().getDbconnection(),succcessCallback);
                                     }else{
                                         var resultData={"status":"fail","content":"DuplicateCheckin"};
                                         succcessCallback(resultData);
                                     }
                                 }else if (rs.rows.item(0).FRIENDID==currentUser.ID){
                                     var ele1=dataJson.lastUpdated.split(" ")[0];
                                     var ele2=rs.rows.item(0).FRIENDLASTUPDATED.split(" ")[0];
                                     if (ele1!==ele2){
                                     	var statement="UPDATE habits SET FRIENDPROGRESS = FRIENDPROGRESS + 1, FRIENDLASTUPDATED = ? WHERE ID = ? AND FRIENDID = ?";
                                     	app.getHabitsp().checkinInner(statement,currentUser,dataJson,app.getSqliteDb().getDbconnection(),succcessCallback);
                                     }else{
                                         var resultData={"status":"fail","content":"DuplicateCheckin"};
                                         succcessCallback(resultData);
                                     }
                                 }
                             }
                         }
                     },function (tx, e){console.log("Error: " + e.message);});
                });
            },
            checkinInner: function(statement,currentUser,dataJson,db,succcessCallback){
                console.log("habitsPool checkinInner");
                db.transaction(function (tx) {
                    tx.executeSql(statement,[dataJson.lastUpdated,dataJson.id,currentUser.ID],function (tx, rs){
                        dataJson.insertedTime=dataJson.lastUpdated;
                        app.getCheckInCommnetsp().create(currentUser,dataJson,app.getSqliteDb().getDbconnection(),succcessCallback);
                    },function (tx, e){var resultData={"status":"fail","content":e.message};succcessCallback(resultData);console.log("Error: " + e.message);});
                });
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

var userControl = (function () {
    var instance;

    function init() {
        var users = [];
        var currentUser;
        console.log("init userControl");
        return {
            loadUsers: function (db) {
                console.log("userControl loadUsers");
                db.transaction(function (tx) {
                    tx.executeSql("select * from users", [], function (tx, rs) {
                        for (var i = 0; i < rs.rows.length; i++) {
                            users.push(rs.rows.item(i));
                            console.log(rs.rows.item(i));
                        }
                    },function (tx, e){console.log("Error: " + e.message);});
                });
            },
            signup: function (signupUser, db) {
                console.log("userControl signup");
                for (var i = 0; i < users.length; i++) {
                    if (users[i].EMAIL == signupUser.email) {
                        return "EmailExist";
                    } else if (users[i].USERNAME == signupUser.username) {
                        return "UsernameExist";
                    }
                }
                db.transaction(function (tx) {
                    console.log('add a new user ' + signupUser.username + ' ' + signupUser.email);
                    var userId=UUID.genV1().toString().split('-').join('');
                    tx.executeSql("INSERT INTO users(ID, EMAIL, USERNAME, PASSWORD, STATUS) VALUES (?,?,?,?,?)", [userId, signupUser.email, signupUser.username, signupUser.password, ''], function (tx, r) {}, function (tx, e){console.log("Error: " + e.message);});
                    users.push({ID:userId,EMAIL:signupUser.email,USERNAME:signupUser.username,PASSWORD:signupUser.password,STATUS:''});
                });
            },
            login: function (email, password) {
                console.log("userControl login");
                console.log(users);
                for (var i = 0; i < users.length; i++) {
                    if (users[i].EMAIL == email){
                        if (users[i].PASSWORD == password){
                            currentUser=users[i];
                            return "correct";
                        }else{
                            return "incorrect";
                        }
                    }
                }
                return "not exist";
            },
            getCurrentUser: function(){
                return currentUser;
            },
            findUsers: function(dataJson,db,successCallback){
                console.log(dataJson);
                console.log("userControl findUsers");
                db.transaction(function (tx) {
                    tx.executeSql("SELECT ID, USERNAME FROM users WHERE USERNAME LIKE '%"+dataJson.username+"%'", [], function (tx, rs) {
                        var resultData='';
                        for (var i = 0; i < rs.rows.length; i++) {
                            resultData=resultData+rs.rows.item(i).ID+':'+rs.rows.item(i).USERNAME+'=';
                        }
                        successCallback(resultData);
                    },function (tx, e){console.log("Error: " + e.message);});
                });
            },
            makeRequest: function(param,dataJson,db){
                db.transaction(function (tx) {
                    tx.executeSql("SELECT ID FROM friends WHERE ((USERA = ? AND USERB = ?) OR (USERA = ? AND USERB = ?))", [dataJson.userA,dataJson.userB,dataJson.userB,dataJson.userA], function (tx, rs) {
                        if (rs.rows.length==0){
                            app.getUserControl().makeRequestInsert(param,dataJson);
                        }
                    },function (tx, e){console.log("Error: " + e.message);});
                });
            },
            makeRequestInsert: function(param,dataJson){
                var db=app.getSqliteDb().getDbconnection();
                db.transaction(function (tx) {
                    var fid=UUID.genV1().toString().split('-').join('');
                    tx.executeSql("INSERT INTO friends(ID, USERA, USERB, STATUS) VALUES (?,?,?,?)", [fid,dataJson.userA,dataJson.userB,"FALSE"], function (tx, rs) {
                       $(param).removeClass("glyphicon-plus-sign").addClass("glyphicon-ok");
                    },function (tx, e){console.log("Error: " + e.message);});
                });
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

var friendsPool = (function () {
    var instance;
    function init() {
        console.log("init friendsPool");
        return{
          loadFriendsData: function(currentUser,db,successCallback){
              console.log("friendsPool loadFriendsData");
              db.transaction(function (tx) {
                    tx.executeSql("SELECT u.id ID, u.username USERNAME FROM users u LEFT JOIN friends f ON u.id IN (f.userA, f.userB) WHERE ? IN (f.userA, f.userB) AND u.id != ? AND f.status = ?", [currentUser.ID, currentUser.ID,"TRUE"], function (tx, rs) {
                        var resultData='';
                        for (var i = 0; i < rs.rows.length; i++) {
                            resultData=resultData+rs.rows.item(i).ID+':'+rs.rows.item(i).USERNAME+'=';
                        }
                        successCallback(resultData);
          			},function (tx, e){console.log("Error: " + e.message);});
              });
        	},
            loadfriendrequests: function(currentUser,db,successCallback){
                 console.log("friendsPool loadfriendrequests");
                 db.transaction(function (tx) {
                     tx.executeSql("SELECT f.id ID, f.userA USERA, u.username USERNAME FROM friends f LEFT JOIN users u ON u.id = f.userA WHERE f.userB = ? AND f.status = ?",[currentUser.ID,"FALSE"],function (tx, rs) {
                         var resultData='';
                         if (rs.rows.length>=0){
                             for (var i=0;i<rs.rows.length;i++){
                                 resultData=resultData+rs.rows.item(i).ID+':'+rs.rows.item(i).USERA+':'+rs.rows.item(i).USERNAME+'=';
                             }
                         }
                         successCallback(resultData);
                     },function (tx, e){console.log("Error: " + e.message);});
                 });
            },
            respondtorequest: function(currentUser,dataJson,db,successCallback){
                var acceptOrDecline=dataJson.acceptOrDecline;
                if (acceptOrDecline=="1"){
                    db.transaction(function (tx) {
                        tx.executeSql("UPDATE friends SET status = ? WHERE id = ? AND userA = ? AND userB = ?",["TRUE",dataJson.id,dataJson.userA,currentUser.ID],function (tx, rs) {
                            var resultData={"status":"success","isConfirm":true};
                            successCallback(resultData);
                        },function (tx, e){
                            console.log("Error: " + e.message);
                            var resultData={"status":"fail","content":e.message};
                            successCallback(resultData);
                        });
                    });
                }else{
                    db.transaction(function (tx) {
                        tx.executeSql("DELETE FROM friends WHERE id = ? AND userA = ? AND userB = ?",[dataJson.id,dataJson.userA,currentUser.ID],function (tx, rs) {
                            var resultData={"status":"success","isConfirm":false};
                            successCallback(resultData);
                        },function (tx, e){
                            console.log("Error: " + e.message);
                            var resultData={"status":"fail","content":e.message};
                            successCallback(resultData);
                        });
                    });
                }
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

var checkinCommnetPool=(function () {
    var instance;
    function init() {
        return{
            load: function(db){
                console.log("checkinCommnetPool load");
            	db.transaction(function(tx){
                    tx.executeSql("SELECT * FROM checkins",[],function (tx, rs){
                        var results=[];
                        for (var i=0;i<rs.rows.length;i++){
                            results.push(rs.rows.item(i));
                        }
                        console.log(results);
                    },function (tx, e){console.log("Error: " + e.message);});
                });
        	},
            create: function(currentUser,dataJson,db,succcessCallback){
                console.log("checkinCommnetPool create");
                console.log(dataJson);
                db.transaction(function(tx){
                    var checkinid=UUID.genV1().toString().split('-').join('');
                    tx.executeSql("INSERT INTO checkins (ID, USERID, HABITID, CONTENT, INSERTEDTIME)VALUES(?, ?, ?, ?, ?)",[checkinid,currentUser.ID,dataJson.id,"You didn't leave a comment this day.",dataJson.insertedTime],function (tx, rs){
                        var resultData={"status":"success","content":checkinid};
                        succcessCallback(resultData);
                    },function (tx, e){var resultData={"status":"fail","content":e.message};succcessCallback(resultData);console.log("Error: " + e.message);});
                });
            },
            update: function(currentUser,dataJson,db,succcessCallback){
                console.log("checkinCommnetPool update");
                console.log(dataJson);
                db.transaction(function(tx){
                    tx.executeSql("UPDATE checkins SET CONTENT = ? WHERE ID = ? and USERID = ?",[dataJson.content,dataJson.id,currentUser.ID],function (tx, rs){
                        var resultData={"status":"success"};
                        succcessCallback(resultData);
                    },function (tx, e){var resultData={"status":"fail","content":e.message};succcessCallback(resultData);console.log("Error: " + e.message);});
                });
            },
            loadAll: function(currentUser,habitId,db,succcessCallback){
                 db.transaction(function(tx){
                     tx.executeSql("SELECT ID, CONTENT, INSERTEDTIME FROM checkins WHERE USERID = ? AND HABITID = ?",[currentUser.ID,habitId],function (tx, rs){
                         var checkinresults=[];
                         for (var i=0;i<rs.rows.length;i++){
                             checkinresults.push(rs.rows.item(i));
                         }
                         var resultData={"status":"success","content":checkinresults};
                         succcessCallback(resultData);
                     },function (tx, e){var resultData={"status":"fail","content":e.message};succcessCallback(resultData);console.log("Error: " + e.message);});
                 });
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