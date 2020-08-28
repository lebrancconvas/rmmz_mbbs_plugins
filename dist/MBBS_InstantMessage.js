//=============================================================================
// RPG Maker MZ - MBBS_InstantMessage.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc A standalone onscreen message logging system.
 * @author Ivan Xu
 *
 * @help MBBS_InstantMessage.js - v1.0.0
 *
 * This plugin can be used for 'Mount & Blade' style battle log or simply for
 * quick debugging display.
 *
 * @command post
 * @text Post
 * @desc Post a message to the screen.
 *
 * @arg text
 * @type string
 * @text Text
 * @desc The text to print.
 *
 * @arg fontSize
 * @type number
 * @default 26
 * @text Font size
 * @desc The size of the font.
 *
 * @arg textColor
 * @type string
 * @default #000000
 * @text Text
 * @desc The color of the text;
 */

(function () {
    'use strict';

    class WindowNotification extends Window_Base {
        constructor(notification) {
            super(notification.getDisplayRect());
            this.opacity = 0;
            this.contentsOpacity = 0;
            this.showCount = 0;
            this.notification = notification;
            console.log(this.notification);
            console.log(this);
        }
        initialize(rect) {
            super.initialize(rect);
            this.refresh();
        }
        update() {
            super.update();
            if (this.showCount > 0) {
                this.contentsOpacity = 255;
                this.showCount--;
            }
            else {
                // fade out
                this.contentsOpacity -= 16;
            }
        }
        open() {
            this.refresh();
            this.showCount = 150;
        }
        /**
         * Should simply redraw the contents based on the state of notification.
         * @private
         */
        refresh() {
            this.contents.clear();
            const maxWidth = this.contentsWidth();
            if (!this.notification)
                return;
            let y = 0;
            this.notification.getMessages().forEach(msg => {
                y = this.drawTextWrap(msg.text, 0, y, maxWidth);
            });
        }
        drawTextWrap(text, x, y, maxWidth) {
            text.split(' ').forEach((word) => {
                word = this.convertEscapeCharacters(word);
                const width = this.textWidth(word + ' ');
                // trigger new-line break
                if (x + width >= this.contentsWidth()) {
                    y += this.lineHeight();
                    x = 0;
                }
                this.drawText(word + ' ', x, y, maxWidth, 'left');
                x += width;
            });
            // Return the y coordinate of the new line.
            return y + this.lineHeight();
        }
    }

    class Notifications {
        constructor(rect) {
            this.maxMsgs = 12;
            this.messages = [];
            this.displayRect = rect; // use default
        }
        getMessages() {
            return this.messages;
        }
        getDisplayRect() {
            return this.displayRect;
        }
        setDisplayRect(rect) {
            this.displayRect = rect;
        }
        post(msg) {
            if (this.messages.push(msg) > this.maxMsgs) {
                this.messages.shift();
            }
        }
        clear() {
            this.messages = [];
        }
    }

    const pluginName = 'MBBS_InstantMessage';
    // const notifications = new Notifications();
    PluginManager.registerCommand(pluginName, 'post', (args) => {
        const color = ColorManager.normalColor();
        const size = $gameSystem.mainFontSize();
        const font = $gameSystem.mainFontFace();
        const text = args.text;
        // @ts-ignore
        SceneManager._scene.notifications.post({ color, size, font, text });
        // @ts-ignore
        SceneManager._scene.notificationWindow.open();
    });
    // @ts-ignore
    Scene_Map = class extends Scene_Map {
        createAllWindows() {
            const displayRect = new Rectangle(0, 64, Graphics.boxWidth / 2, Graphics.boxHeight);
            this.notifications = new Notifications(displayRect);
            this.notificationWindow = new WindowNotification(this.notifications);
            this.addWindow(this.notificationWindow);
            super.createAllWindows();
        }
        start() {
            var _a;
            super.start();
            (_a = this.notificationWindow) === null || _a === void 0 ? void 0 : _a.show();
        }
        update() {
            var _a;
            super.update();
            (_a = this.notificationWindow) === null || _a === void 0 ? void 0 : _a.update();
        }
        stop() {
            var _a;
            super.stop();
            (_a = this.notificationWindow) === null || _a === void 0 ? void 0 : _a.hide();
        }
    };

}());
