
        var WUTIS = {
            "t_p": 0,    //掉落金币的道具
            "t_t": 1,    //掉落加速加血的道具
            "t_m": 2,    //移动的物体
            "t_g": 3,    //静止的自动炮
            "t_z": 4,    //追踪弹
            0: {
                g: 16,  //概率权重
                t: 0,   //类型
                img: "wt0",
                rd: 15,
                h: 2,
                v: 1,   //分数+
            },
            1: {
                g: 11,
                t: 0,   //类型
                img: "wt2",
                rd: 15,
                h: 4,
                v: 2,   //分数+
            },
            2: {
                g: 7,
                t: 0,   //类型
                img: "wt3",
                rd: 15,
                h: 7,
                v: 4,   //分数+
            },
            3: {
                g: 4,
                t: 0,   //类型
                img: "wt4",
                rd: 15,
                h: 11,
                v: 6,   //分数+
            },
            4: {
                g: 2,
                t: 0,   //类型
                img: "wt5",
                rd: 15,
                h: 16,
                v: 10,   //分数+
            },
            5: {
                g: 1,
                t: 0,   //类型
                img: "wt6",
                rd: 15,
                h: 22,
                v: 16,   //分数+
            },
            10: {
                g: 30,
                t: 1,   //类型
                img: "wt1",
                rd: 15,
                h: 3,
                v: 1,   //分数+
            },

            suiji: []
        };
        (function () {
            var wi_count = 0;
            for (var wi in WUTIS) {
                if (WUTIS[wi].g !== undefined) {
                    wi_count += WUTIS[wi].g;
                }
            }
            var gailv = 0;
            for (var wi in WUTIS) {
                if (WUTIS[wi].g !== undefined) {
                    gailv += WUTIS[wi].g / wi_count;
                    WUTIS.suiji.push(gailv, wi);
                }
            }
        })();
        
        module.exports = WUTIS;
        
        