/**
 *  baseApiUrl 必须配置
 *  share_text 可选配置
 *  web        可选配置
 *  appDebug   可选配置
 *  ...        可选配置
 */
var Config = {
    //默认分享文字
     'share_text' : {
       'title': '物美价优的全国特产小吃商城，快来一起“田趣小集”看看有没有您熟悉的味道',
        'path' :　'pages/index/index'
     },

     //接口 基础 url
     "baseApiUrl": "https://www.xxxxxx", //此处填写实际线上地址
     "baseDebugApiUrl": "http://127.0.0.1:8012",
    //网站配置
  "web": {
    
      "url": "127.0.0.1",
        "name" : "田趣小集",
    }, 
    
    //是否开启测试
    "appDevelop": false,
    "appDebug" : false,
    "appLog": true,
  "recommed_cusume_check": 298,
    //错误信息
    "error_text" : {
        0: "服务器繁忙，请稍后再试",
        1: "您还没有填写收货信息哦~",
        2: "Oops! 这个团已经不在地球上了，快去首页火拼吧！",
        3: "您还没有参加过任何团哦，赶快去首页火拼吧！",
        4: "商品已下架或不存在，赶快去首页看看吧！",
        5: "您的地址信息不完整，请先完善地址信息吧~",
        6: "订单信息错误~",
        7: "暂时没有物流信息",
        8: "获取快递信息失败, 请稍后再试",
        9: "获取订单失败，请稍后再试！",
        10: "您还没有优惠券哦~",
        11: "您还没有填写联系人信息哦~~"
    },

    //订单状态
    "order_status" : {
        0 : "待支付",
        1:  "已支付，待发货",
        2 : "待收货", 
        3 : "待评论",
        4 : "已完成", 
      5: "礼物待赠送",
        6 : "订单已退款",
        7 : "待成团", 
        8: "支付失败，即将自动取消",
        9:"成团失败，已退款",
        10: "成团失败，正在退款",
        11: "已支付，待赠送",
        12: "礼物已送出",
        13: "送礼超时，已退款",
    },


  "refundprocess_status": {
    0: "未申请",
    1: "等待卖家回复",
    2: "商家接受了请求，退款中",
    3: "商家拒绝了请求",
    4: "商家回复超时，退款中",
    5: "等待商家确认收货",
    6: "订单退款中",
    7: "订单退款成功",
    8: "平台处理中",
    9: "平台协商完成",
    
  },
    
    "page_offset" : 0,
    
    "page_size" : 20,

    //默认用户信息
    "userInfo" : {
          "nickName" : "游客",
          "avatarUrl" :　"http://139.199.168.122:8989/Public/Api/images/logo.png"
    },

    //页面加载提示信息
     pullload_text: {
            load_text: "正在加载...",
            no_datas: "没有更多的订单了...",
            no_shopcollects: "没有更多的收藏...",
            no_goodscollects: "没有更多的收藏...",
            no_tuan_orders: "没有更多的团订单了...",
            no_goods: "没有更多了...",
       no_more: "没有更多了...",
       no_account_records: "没有更多的账户明细...",
       no_refunds: "没有更多售后记录",
       no_discount_goods: "没有更多活动商品..."
        },
        pullload_last_text: {
            bottom_text: "↑ 继续向上滑将切换到下一个频道",
            bottom_text_ready_to_next_channel: "↓ 松开按键切换到下一个频道",
            change_channel_tip: "正在加载下一个频道"
        },
        tuan_status: {
            0: {
                desc: "团购进行中",
                tips_title: {
                    0: "快来入团吧",
                    1: "参团成功",
                    2: "开团成功"
                },
                tips_detail: {
                    0: "就差你了",
                    1: "快去邀请好友加入吧",
                    2: "快去邀请好友加入吧"
                }
            },
            1: {
                desc: "团购成功",
                tips_title: {
                    0: "来晚了一步！该团已经组团成功",
                    1: "团购成功",
                    2: "团购成功"
                },
                tips_detail: {
                    0: "求人不如求自己，自己当团长吧！",
                    1: "我们会尽快为您发货，请耐心等待",
                    2: "我们会尽快为您发货，请耐心等待"
                }
            },
            2: {
                desc: "团购失败",
                tips_title: {
                    0: "来晚了一步！",
                    1: "团购失败",
                    2: "团购失败"
                },
                tips_detail: {
                    0: "",
                    1: "",
                    2: ""
                }
            }
        },

        giver_status: {
          0: {
            desc: "礼物待领",
            tips_title: {
              0: "收到一份礼物",
              
            },
            tips_detail: {
              0: "快去填写地址领取礼物吧",
              
            }
          },
          1: {
            desc: "礼物已领",
            tips_title: {
              0: "来晚了一步！该礼物已被别人领走了",
              
            },
            tips_detail: {
              0: "礼物可以被分享给多个人，下次要手快一点哦",
              
            }
          },

          2: {
            desc: "领取超时",
            tips_title: {
              0: "领取礼物超时，已退款"

            },
            tips_detail: {
              0: "礼物长时间未领取将自动退款给送礼人,下次记得早点领取哦"

            }
          },
          
        },

  lottery_status: {
    0: {
      desc: "奖品待领",
      tips_title: {
        0: "赢得一份奖品",

      },
      tips_detail: {
        0: "快去填写地址领取吧",

      }
    },
    1: {
      desc: "奖品已领",
      tips_title: {
        0: "来晚了一步！该奖品已被别人领走了",

      },
      tips_detail: {
        0: "奖品可以被分享给多个人，下次要手快一点哦",

      }
    },

  },

        group_text: {
            0: "还差%s人组团成功,点击邀请好友",
            1: "我也要参团",
            2: "我也开个团，点此回商品列表。"
        },
        giver_text: {
          0: "快去绑定地址领取礼物吧，礼物分享给多人时，最快的人才能得到哦",
          1: "礼物已经被领走了",
          
        },
        pay_text: {
            success: "支付成功",
            fail: "支付失败",
            cancel: "支付取消"
        },
        group_pic : {
            'defaultAvatar' : "http://139.199.168.122:8989/Public/Api/images/avatar_4_64.png"
        },       
};

function config() {
    return Config;
}
module.exports = {
  config : config
}

