const TYPE = cc.Enum({
    ZERO: 0,
    ONE: 1,
    TWO: 2,
    THREE: 3,
    BOMB_DEATH: 4,
    BOMB_MISS_FLAG: 5,
    BOMB_REVEALED: 6,
    BOMB_QUESTION: 7,
});
const STATE = cc.Enum({
    NONE: -1,
    CLICKED: -1,
    FLAG: -1,
    DOUBT: -1,
});

module.exports = {
    STATE: STATE,
    TYPE: TYPE,
};

cc.Class({
    extends: cc.Component,

    properties: {
        picNone: cc.SpriteFrame,
        picFlag: cc.SpriteFrame,
        picDoubt: cc.SpriteFrame,
        picZero: cc.SpriteFrame,
        picOne: cc.SpriteFrame,
        picTwo: cc.SpriteFrame,
        picThree: cc.SpriteFrame,
        picBombDeath: cc.SpriteFrame,
        PicBombMissFlag: cc.SpriteFrame,
        PicBombRevealed: cc.SpriteFrame,
        PicBombQuestion: cc.SpriteFrame,
        _state: {
            default: STATE.NONE,
            type: STATE,
            visible: false
        },
        state: {
            get: function() {
                return this._state;
            },
            set: function(value) {
                if (value !== this._state) {
                    this._state = value;
                    switch (this._state) {
                        case STATE.CLICKED:
                            this.showType();
                            break;
                        case STATE.NONE:
                            this.getComponent(cc.Sprite).spriteFrame = this.picNone;
                            break;
                        case STATE.FLAG:
                            this.getComponent(cc.Sprite).spriteFrame = this.picFlag;
                            break;
                        case STATE.DOUBT:
                            this.getComponent(cc.Sprite).spriteFrame = this.picDoubt;
                            break;
                        default:
                            break;
                    }
                }
            },
            type: STATE,
        },
        type: {
            default: TYPE.ZERO,
            type: TYPE,
        },
    },

    showType: function() {
        switch (this.type) {
            case TYPE.ZERO:
                this.getComponent(cc.Sprite).spriteFrame = this.picZero;
                break;
            case TYPE.ONE:
                this.getComponent(cc.Sprite).spriteFrame = this.picOne;
                break;
            case TYPE.TWO:
                this.getComponent(cc.Sprite).spriteFrame = this.picTwo;
                break;
            case TYPE.THREE:
                this.getComponent(cc.Sprite).spriteFrame = this.picThree;
                break;
            case TYPE.BOMB_DEATH:
                this.getComponent(cc.Sprite).spriteFrame = this.picBombDeath;
                break;
            case TYPE.BOMB_MISS_FLAG:
                this.getComponent(cc.Sprite).spriteFrame = this.PicBombMissFlag;
                break;
            case TYPE.BOMB_REVEALED:
                this.getComponent(cc.Sprite).spriteFrame = this.PicBombRevealed;
                break;
            case TYPE.BOMB_QUESTION:
                this.getComponent(cc.Sprite).spriteFrame = this.PicBombRevealed;
                break;
            default:
                break;
        }
    }
});