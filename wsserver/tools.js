
        var tools = {};
        tools.deg2vector = function () {
            var degreeToRadiansFactor = Math.PI / 180;
            return function (deg, rst) {
                var result = rst || { x: 0, y: 0 };
                var rad = (deg % 360) * degreeToRadiansFactor;
                result.y = Math.round(Math.sin(rad) * 1000) / 1000;
                result.x = Math.round(Math.cos(rad) * 1000) / 1000;
                return result;
            }
        }();
        tools.vector2deg = function () {
            var radianToDegreesFactor = 180 / Math.PI;
            return function (x, y) {
                if (x == 0 && y == 0) {
                    return 360;
                }
                rad = Math.atan(y / x);
                var result = rad * radianToDegreesFactor;
                if (x < 0) {
                    result += 180;
                }
                if (result < 0) {
                    result += 360;
                }
                return result;
            }
        }();
        tools.w2level = function (w) {  //w经验转等级
            w = w << 1;
            var m = Math.floor(Math.sqrt(w));
            if (w < m * m + m) {
                return m - 1;
            }
            return m;
        }
        tools.level2w = function (level) {
            return Math.round((level * level) + level / 2);
        }
        tools.w2health = function (w) {  //w经验转生命值
            return tools.level2health(tools.w2level(w));
        }
        tools.level2health = function (lv) {  //w经验转生命值
            return 10 + (lv << 1);
        }
        function clone(myObj) {
            if (typeof (myObj) != 'object') return myObj;
            if (myObj == null) return myObj;

            var myNewObj;
            if (myObj.constructor) {
                myNewObj = new myObj.constructor();
            } else
                myNewObj = {}
            for (var i in myObj)
                myNewObj[i] = clone(myObj[i]);
            return myNewObj;
        }
        tools.clone = clone;
        
        module.exports = tools;
        
        