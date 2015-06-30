/**!
 * ΢�������������Javascript API�����ܰ�����
 *
 * 1������΢������Ȧ
 * 2�������΢�ź���
 * 3��������Ѷ΢��
 * 4���µķ���ӿڣ���������Ȧ�����ѡ�΢���ķ���for iOS��
 * 5������/��ʾ���ϽǵĲ˵����
 * 6������/��ʾ�ײ������������
 * 7����ȡ��ǰ������״̬
 * 8������΢�ſͻ��˵�ͼƬ�������
 * 9���رչ���ƽ̨Webҳ��
 * 10���жϵ�ǰ��ҳ�Ƿ���΢������������д�
 * 11�����Ӵ�ɨ���ά��
 * 12��֧��WeixinApi�Ĵ�����
 * 13�����Ӧ�ó����Ƿ��Ѿ���װ����Ҫ�ٷ���ͨȨ�ޣ�
 * 14����΢�����õ�ͼ����֤���Ĺ��ںſ��ã�
 * 15�����͵����ʼ�
 *
 * @author zhaoxianlie(http://www.baidufe.com)
 */ (function(window) {

    "use strict";

    /**
     * ����WeixinApi
     */
    var WeixinApi = {
        version: 2.8
    };

    // ��WeixinApi��¶��window�£�ȫ�ֿ�ʹ�ã��Ծɰ汾���¼���
    window.WeixinApi = WeixinApi;

    /////////////////////////// CommonJS /////////////////////////////////
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        if (define.amd) {
            // AMD �淶��for��requirejs
            define(function() {
                return WeixinApi;
            });
        } else if (define.cmd) {
            // CMD �淶��for��seajs
            define(function(require, exports, module) {
                module.exports = WeixinApi;
            });
        }
    }

    /**
     * �ڲ�˽�з�����������
     * @private
     */
    var _share = function(cmd, data, callbacks) {
        callbacks = callbacks || {};

        // ��������е�һЩ�ص�
        var progress = function(resp) {
            switch (true) {
                // �û�ȡ��
                case /\:cancel$/i.test(resp.err_msg):
                    callbacks.cancel && callbacks.cancel(resp);
                    break;
                    // ���ͳɹ�
                case /\:(confirm|ok)$/i.test(resp.err_msg):
                    callbacks.confirm && callbacks.confirm(resp);
                    break;
                    // fail������ʧ��
                case /\:fail$/i.test(resp.err_msg):
                default:
                    callbacks.fail && callbacks.fail(resp);
                    break;
            }
            // ���۳ɹ�ʧ�ܶ���ִ�еĻص�
            callbacks.all && callbacks.all(resp);
        };

        // ִ�з�����������
        var handler = function(theData, argv) {
            // �µķ���ӿڣ���������
            if (cmd.menu === 'menu:general:share') {
                // ����Ƿ�������Ȧ������Ҫ��title��desc����һ��
                if (argv.shareTo == 'timeline') {
                    var title = theData.title;
                    theData.title = theData.desc || title;
                    theData.desc = title;
                } else if (argv.shareTo == 'favorite') {
                    // ������ղز�����������wxCallbacks��������favoriteΪfalse����ִ�лص�
                    if (callbacks.favorite === false) {
                        return argv.generalShare(theData, function() {});
                    }
                }

                argv.generalShare(theData, progress);
            } else {
                WeixinJSBridge.invoke(cmd.action, theData, progress);
            }
        };

        // �����������
        WeixinJSBridge.on(cmd.menu, function(argv) {
            if (callbacks.async && callbacks.ready) {
                var _callbackKey = "_wx_loadedCb_";
                WeixinApi[_callbackKey] = callbacks.dataLoaded || new Function();
                if (WeixinApi[_callbackKey].toString().indexOf(_callbackKey) > 0) {
                    WeixinApi[_callbackKey] = new Function();
                }
                callbacks.dataLoaded = function(newData) {
                    WeixinApi[_callbackKey](newData);
                    handler(newData, argv);
                };
                // Ȼ�����
                if (!(argv && argv.shareTo == 'favorite' && callbacks.favorite === false)) {
                    callbacks.ready && callbacks.ready(argv);
                }
            } else {
                // ����״̬
                if (!(argv && argv.shareTo == 'favorite' && callbacks.favorite === false)) {
                    callbacks.ready && callbacks.ready(argv);
                }
                handler(data, argv);
            }
        });
    };

    /**
     * ����΢������Ȧ
     * @param       {Object}    data       ���������Ϣ
     * @p-config    {String}    appId      ����ƽ̨��appId������ſ��ã�
     * @p-config    {String}    imgUrl     ͼƬ��ַ
     * @p-config    {String}    link       ���ӵ�ַ
     * @p-config    {String}    desc       ����
     * @p-config    {String}    title      ����ı���
     *
     * @param       {Object}    callbacks  ��ػص�����
     * @p-config    {Boolean}   async                   ready�����Ƿ���Ҫ�첽ִ�У�Ĭ��false
     * @p-config    {Function}  ready(argv)             ����״̬
     * @p-config    {Function}  dataLoaded(data)        ���ݼ�����ɺ���ã�asyncΪtrueʱ���ã�Ҳ����Ϊ��
     * @p-config    {Function}  cancel(resp)    ȡ��
     * @p-config    {Function}  fail(resp)      ʧ��
     * @p-config    {Function}  confirm(resp)   �ɹ�
     * @p-config    {Function}  all(resp)       ���۳ɹ�ʧ�ܶ���ִ�еĻص�
     */
    WeixinApi.shareToTimeline = function(data, callbacks) {
        _share({
            menu: 'menu:share:timeline',
            action: 'shareTimeline'
        }, {
            "appid": data.appId ? data.appId : '',
            "img_url": data.imgUrl,
            "link": data.link,
            "desc": data.title,
            "title": data.desc,
            "img_width": "640",
            "img_height": "640"
        }, callbacks);
    };

    /**
     * ���͸�΢���ϵĺ���
     * @param       {Object}    data       ���������Ϣ
     * @p-config    {String}    appId      ����ƽ̨��appId������ſ��ã�
     * @p-config    {String}    imgUrl     ͼƬ��ַ
     * @p-config    {String}    link       ���ӵ�ַ
     * @p-config    {String}    desc       ����
     * @p-config    {String}    title      ����ı���
     *
     * @param       {Object}    callbacks  ��ػص�����
     * @p-config    {Boolean}   async                   ready�����Ƿ���Ҫ�첽ִ�У�Ĭ��false
     * @p-config    {Function}  ready(argv)             ����״̬
     * @p-config    {Function}  dataLoaded(data)        ���ݼ�����ɺ���ã�asyncΪtrueʱ���ã�Ҳ����Ϊ��
     * @p-config    {Function}  cancel(resp)    ȡ��
     * @p-config    {Function}  fail(resp)      ʧ��
     * @p-config    {Function}  confirm(resp)   �ɹ�
     * @p-config    {Function}  all(resp)       ���۳ɹ�ʧ�ܶ���ִ�еĻص�
     */
    WeixinApi.shareToFriend = function(data, callbacks) {
        _share({
            menu: 'menu:share:appmessage',
            action: 'sendAppMessage'
        }, {
            "appid": data.appId ? data.appId : '',
            "img_url": data.imgUrl,
            "link": data.link,
            "desc": data.desc,
            "title": data.title,
            "img_width": "640",
            "img_height": "640"
        }, callbacks);
    };


    /**
     * ������Ѷ΢��
     * @param       {Object}    data       ���������Ϣ
     * @p-config    {String}    link       ���ӵ�ַ
     * @p-config    {String}    desc       ����
     *
     * @param       {Object}    callbacks  ��ػص�����
     * @p-config    {Boolean}   async                   ready�����Ƿ���Ҫ�첽ִ�У�Ĭ��false
     * @p-config    {Function}  ready(argv)             ����״̬
     * @p-config    {Function}  dataLoaded(data)        ���ݼ�����ɺ���ã�asyncΪtrueʱ���ã�Ҳ����Ϊ��
     * @p-config    {Function}  cancel(resp)    ȡ��
     * @p-config    {Function}  fail(resp)      ʧ��
     * @p-config    {Function}  confirm(resp)   �ɹ�
     * @p-config    {Function}  all(resp)       ���۳ɹ�ʧ�ܶ���ִ�еĻص�
     */
    WeixinApi.shareToWeibo = function(data, callbacks) {
        _share({
            menu: 'menu:share:weibo',
            action: 'shareWeibo'
        }, {
            "content": data.desc,
            "url": data.link
        }, callbacks);
    };

    /**
     * �µķ���ӿ�
     * @param       {Object}    data       ���������Ϣ
     * @p-config    {String}    appId      ����ƽ̨��appId������ſ��ã�
     * @p-config    {String}    imgUrl     ͼƬ��ַ
     * @p-config    {String}    link       ���ӵ�ַ
     * @p-config    {String}    desc       ����
     * @p-config    {String}    title      ����ı���
     *
     * @param       {Object}    callbacks  ��ػص�����
     * @p-config    {Boolean}   async                   ready�����Ƿ���Ҫ�첽ִ�У�Ĭ��false
     * @p-config    {Function}  ready(argv,shareTo)     ����״̬
     * @p-config    {Function}  dataLoaded(data)        ���ݼ�����ɺ���ã�asyncΪtrueʱ���ã�Ҳ����Ϊ��
     * @p-config    {Function}  cancel(resp,shareTo)    ȡ��
     * @p-config    {Function}  fail(resp,shareTo)      ʧ��
     * @p-config    {Function}  confirm(resp,shareTo)   �ɹ�
     * @p-config    {Function}  all(resp,shareTo)       ���۳ɹ�ʧ�ܶ���ִ�еĻص�
     */
    WeixinApi.generalShare = function(data, callbacks) {
        _share({
            menu: 'menu:general:share'
        }, {
            "appid": data.appId ? data.appId : '',
            "img_url": data.imgUrl,
            "link": data.link,
            "desc": data.title,
            "title": data.desc,
            "img_width": "640",
            "img_height": "640"
        }, callbacks);
    };

    /**
     * �ӹ�ע���˹���ֻ����ʱ�ȼ��ϣ�������ΪȨ���������⣬�����ã�������վ���ǲ�����*.qq.com�£�Ҳ����У�
     * @param       {String}    appWeixinId     ΢�Ź��ں�ID
     * @param       {Object}    callbacks       �ص�����
     * @p-config    {Function}  fail(resp)      ʧ��
     * @p-config    {Function}  confirm(resp)   �ɹ�
     */
    WeixinApi.addContact = function(appWeixinId, callbacks) {
        callbacks = callbacks || {};
        WeixinJSBridge.invoke("addContact", {
            webtype: "1",
            username: appWeixinId
        }, function(resp) {
            var success = !resp.err_msg || "add_contact:ok" == resp.err_msg || "add_contact:added" == resp.err_msg;
            if (success) {
                callbacks.success && callbacks.success(resp);
            } else {
                callbacks.fail && callbacks.fail(resp);
            }
        })
    };

    /**
     * ����΢��Native��ͼƬ���������
     * �������Բ�������ǿ��⣬����������Ϸ���ֱ�ӻᵼ��΢�ſͻ���crash
     *
     * @param {String} curSrc ��ǰ���ŵ�ͼƬ��ַ
     * @param {Array} srcList ͼƬ��ַ�б�
     */
    WeixinApi.imagePreview = function(curSrc, srcList) {
        if (!curSrc || !srcList || srcList.length == 0) {
            return;
        }
        WeixinJSBridge.invoke('imagePreview', {
            'current': curSrc,
            'urls': srcList
        });
    };

    /**
     * ��ʾ��ҳ���Ͻǵİ�ť
     */
    WeixinApi.showOptionMenu = function() {
        WeixinJSBridge.call('showOptionMenu');
    };


    /**
     * ������ҳ���Ͻǵİ�ť
     */
    WeixinApi.hideOptionMenu = function() {
        WeixinJSBridge.call('hideOptionMenu');
    };

    /**
     * ��ʾ�ײ�������
     */
    WeixinApi.showToolbar = function() {
        WeixinJSBridge.call('showToolbar');
    };

    /**
     * ���صײ�������
     */
    WeixinApi.hideToolbar = function() {
        WeixinJSBridge.call('hideToolbar');
    };

    /**
     * �������¼������ͣ�
     *
     * network_type:wifi     wifi����
     * network_type:edge     ��wifi,����3G/2G
     * network_type:fail     ����Ͽ�����
     * network_type:wwan     2g����3g
     *
     * ʹ�÷�����
     * WeixinApi.getNetworkType(function(networkType){
     *
     * });
     *
     * @param callback
     */
    WeixinApi.getNetworkType = function(callback) {
        if (callback && typeof callback == 'function') {
            WeixinJSBridge.invoke('getNetworkType', {}, function(e) {
                // �������õ�e.err_msg��������Ͱ��������е���������
                callback(e.err_msg);
            });
        }
    };

    /**
     * �رյ�ǰ΢�Ź���ƽ̨ҳ��
     * @param       {Object}    callbacks       �ص�����
     * @p-config    {Function}  fail(resp)      ʧ��
     * @p-config    {Function}  success(resp)   �ɹ�
     */
    WeixinApi.closeWindow = function(callbacks) {
        callbacks = callbacks || {};
        WeixinJSBridge.invoke("closeWindow", {}, function(resp) {
            switch (resp.err_msg) {
                // �رճɹ�
                case 'close_window:ok':
                    callbacks.success && callbacks.success(resp);
                    break;

                    // �ر�ʧ��
                default:
                    callbacks.fail && callbacks.fail(resp);
                    break;
            }
        });
    };

    /**
     * ��ҳ�������Ϻ�ִ�У�ʹ�÷�����
     * WeixinApi.ready(function(Api){
     *     // ������ֻ��Api����WeixinApi
     * });
     * @param readyCallback
     */
    WeixinApi.ready = function(readyCallback) {
        if (readyCallback && typeof readyCallback == 'function') {
            var Api = this;
            var wxReadyFunc = function() {
                readyCallback(Api);
            };
            if (typeof window.WeixinJSBridge == "undefined") {
                if (document.addEventListener) {
                    document.addEventListener('WeixinJSBridgeReady', wxReadyFunc, false);
                } else if (document.attachEvent) {
                    document.attachEvent('WeixinJSBridgeReady', wxReadyFunc);
                    document.attachEvent('onWeixinJSBridgeReady', wxReadyFunc);
                }
            } else {
                wxReadyFunc();
            }
        }
    };

    /**
     * �жϵ�ǰ��ҳ�Ƿ���΢������������д�
     */
    WeixinApi.openInWeixin = function() {
        return /MicroMessenger/i.test(navigator.userAgent);
    };

    /*
     * ��ɨ���ά��
     * @param       {Object}    callbacks       �ص�����
     * @p-config    {Function}  fail(resp)      ʧ��
     * @p-config    {Function}  success(resp)   �ɹ�
     */
    WeixinApi.scanQRCode = function(callbacks) {
        callbacks = callbacks || {};
        WeixinJSBridge.invoke("scanQRCode", {}, function(resp) {
            switch (resp.err_msg) {
                // ��ɨ�����ɹ�
                case 'scan_qrcode:ok':
                    callbacks.success && callbacks.success(resp);
                    break;

                    // ��ɨ����ʧ��
                default:
                    callbacks.fail && callbacks.fail(resp);
                    break;
            }
        });
    };

    /**
     * ���Ӧ�ó����Ƿ��Ѱ�װ
     *         by mingcheng 2014-10-17
     *
     * @param       {Object}    data               Ӧ�ó������Ϣ
     * @p-config    {String}    packageUrl      Ӧ��ע����Զ���ǰ׺���� xxx:// ��ȡ xxx
     * @p-config    {String}    packageName        Ӧ�õİ���
     *
     * @param       {Object}    callbacks       ��ػص�����
     * @p-config    {Function}  fail(resp)      ʧ��
     * @p-config    {Function}  success(resp)   �ɹ�������ж�Ӧ�İ汾��Ϣ����д�뵽 resp.version ��
     * @p-config    {Function}  all(resp)       ���۳ɹ�ʧ�ܶ���ִ�еĻص�
     */
    WeixinApi.getInstallState = function(data, callbacks) {
        callbacks = callbacks || {};

        WeixinJSBridge.invoke("getInstallState", {
            "packageUrl": data.packageUrl || "",
            "packageName": data.packageName || ""
        }, function(resp) {
            var msg = resp.err_msg,
                match = msg.match(/state:yes_?(.*)$/);
            if (match) {
                resp.version = match[1] || "";
                callbacks.success && callbacks.success(resp);
            } else {
                callbacks.fail && callbacks.fail(resp);
            }

            callbacks.all && callbacks.all(resp);
        });
    };

    /**
     * ����ҳ��ֱ�ӵ���΢�ŵ�ͼ
     *
     * @param       {Object}    data             �򿪵�ͼ����Ҫ������
     * @p-config    {String}    latitude         γ��
     * @p-config    {String}    longitude        ����
     * @p-config    {String}    name             POI����
     * @p-config    {String}    adress           ��ַ
     * @p-config    {String}    scale            ����
     * @p-config    {String}    infoUrl          �鿴λ�ý���ײ��ĳ�����
     *
     * @param       {Object}    callbacks       ��ػص�����
     * @p-config    {Function}  fail(resp)      ʧ��
     * @p-config    {Function}  success(resp)   �ɹ�
     * @p-config    {Function}  all(resp)       ���۳ɹ�ʧ�ܶ���ִ�еĻص�
     */
    WeixinApi.openLocation = function(data, callbacks) {
        callbacks = callbacks || {};
        WeixinJSBridge.invoke('openLocation', {
            "latitude": data.latitude,
            "longitude": data.longitude,
            "name": data.name,
            "address": data.address,
            "scale": data.scale || 14,
            "infoUrl": data.infoUrl || ''
        }, function(resp) {
            if (resp.err_msg === "open_location:ok") {
                callbacks.success && callbacks.success(resp);
            } else {
                callbacks.fail && callbacks.fail(resp);
            }
            callbacks.all && callbacks.all(resp);
        });
    };

    /**
     * �����ʼ�
     * @param       {Object}  data      �ʼ���ʼ����
     * @p-config    {String}  subject   �ʼ�����
     * @p-config    {String}  body      �ʼ�����
     *
     * @param       {Object}    callbacks       ��ػص�����
     * @p-config    {Function}  fail(resp)      ʧ��
     * @p-config    {Function}  success(resp)   �ɹ�
     * @p-config    {Function}  all(resp)       ���۳ɹ�ʧ�ܶ���ִ�еĻص�
     */
    WeixinApi.sendEmail = function(data, callbacks) {
        callbacks = callbacks || {};
        WeixinJSBridge.invoke("sendEmail", {
            "title": data.subject,
            "content": data.body
        }, function(resp) {
            if (resp.err_msg === 'send_email:sent') {
                callbacks.success && callbacks.success(resp);
            } else {
                callbacks.fail && callbacks.fail(resp);
            }
            callbacks.all && callbacks.all(resp);
        })
    };

    /**
     * ����Api��debugģʽ��������˸�ʲô������alert�����㣬������һֱ�ܿ�Ƶ������Ķ���������
     * @param    {Function}  callback(error) �����Ļص���Ĭ����alert
     */
    WeixinApi.enableDebugMode = function(callback) {
        /**
         * @param {String}  errorMessage   ������Ϣ
         * @param {String}  scriptURI      ������ļ�
         * @param {Long}    lineNumber     ���������к�
         * @param {Long}    columnNumber   ���������к�
         */
        window.onerror = function(errorMessage, scriptURI, lineNumber, columnNumber) {

            // ��callback������£���������Ϣ���ݵ�options.callback��
            if (typeof callback === 'function') {
                callback({
                    message: errorMessage,
                    script: scriptURI,
                    line: lineNumber,
                    column: columnNumber
                });
            } else {
                // �������������alert��ʽֱ����ʾ������Ϣ
                var msgs = [];
                msgs.push("������д�����");
                msgs.push("\n������Ϣ��", errorMessage);
                msgs.push("\n�����ļ���", scriptURI);
                msgs.push("\n����λ�ã�", lineNumber + '�У�' + columnNumber + '��');
                alert(msgs.join(''));
            }
        }
    };

})(window);