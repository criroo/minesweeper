const GAME_STATE = cc.Enum({
    PREPARE: -1,
    PLAY: -1,
    DEAD: -1,
    WIN: -1
});
const TOUCH_STATE = cc.Enum({
    BLANK: -1,
    FLAG: -1,
});

cc.Class({
    extends: cc.Component,

    properties: {
        tilesLayout: cc.Node,
        tile: cc.Prefab,
        btnShow: cc.Node,
        tiles: [],
        picPrepare: cc.SpriteFrame,
        picPlay: cc.SpriteFrame,
        picDead: cc.SpriteFrame,
        picWin: cc.SpriteFrame,
        textTime: cc.Label,
        countBomb: cc.Label,
        gameState: {
            default: GAME_STATE.PREPARE,
            type: GAME_STATE,
        },
        touchState: {
            default: TOUCH_STATE.BLANK,
            type: TOUCH_STATE,
        },
        row: 0,
        col: 0,
        bombNum: 0,
        listInter: []
    },

    onLoad: function() {
        this.Tile = require("Tile");
        var self = this;
        for (let y = 0; y < this.row; y++) {
            for (let x = 0; x < this.col; x++) {
                let tile = cc.instantiate(this.tile);
                tile.name = String(y * this.col + x);
                tile.on(cc.Node.EventType.MOUSE_UP, function(event) {
                    if (event.getButton() === cc.Event.EventMouse.BUTTON_LEFT) {
                        self.touchState = TOUCH_STATE.BLANK;
                    } else if (event.getButton() === cc.Event.EventMouse.BUTTON_RIGHT) {
                        self.touchState = TOUCH_STATE.FLAG;
                    }
                    self.onTouchTile(tile);
                });
                this.tilesLayout.addChild(tile);
                this.tiles.push(tile);
            }
        }
        this.newGame();
    },

    newGame: function() {
        //init game
        for (let n = 0; n < this.tiles.length; n++) {
            this.tiles[n].getComponent("Tile").type = this.Tile.TYPE.ZERO;
            this.tiles[n].getComponent("Tile").state = this.Tile.STATE.NONE;
        }
        //add mines
        var tilesIndex = [];
        for (var i = 0; i < this.tiles.length; i++) {
            tilesIndex[i] = i;
        }
        for (var j = 0; j < this.bombNum; j++) {
            var n = Math.floor(Math.random() * tilesIndex.length);
            this.tiles[tilesIndex[n]].getComponent("Tile").type = this.Tile.TYPE.BOMB_REVEALED;
            tilesIndex.splice(n, 1);
        }
        //Mark the tiles around the mine
        for (var k = 0; k < this.tiles.length; k++) {
            var tempBomb = 0;
            if (this.tiles[k].getComponent("Tile").type == this.Tile.TYPE.ZERO) {
                var roundTiles = this.tileRound(k);
                for (var m = 0; m < roundTiles.length; m++) {
                    if (roundTiles[m].getComponent("Tile").type == this.Tile.TYPE.BOMB_REVEALED) {
                        tempBomb++;
                    }
                }
                this.tiles[k].getComponent("Tile").type = tempBomb;

            }
        }
        this.gameState = GAME_STATE.PLAY;
        this.btnShow.getComponent(cc.Sprite).spriteFrame = this.picPlay;
        //start time up
        var time = 0;
        this.countDownGamePlay(time, this.textTime);
    },


    tileRound: function(i) {
        var roundTiles = [];
        if (i % this.col > 0) { //left
            roundTiles.push(this.tiles[i - 1]);
        }
        if (i % this.col > 0 && Math.floor(i / this.col) > 0) { //left top
            roundTiles.push(this.tiles[i - this.col - 1]);
        }
        if (i % this.col > 0 && Math.floor(i / this.col) < this.row - 1) { //left bottom
            roundTiles.push(this.tiles[i + this.col - 1]);
        }
        if (Math.floor(i / this.col) > 0) { //bottom
            roundTiles.push(this.tiles[i - this.col]);
        }
        if (Math.floor(i / this.col) < this.row - 1) { //top
            roundTiles.push(this.tiles[i + this.col]);
        }
        if (i % this.col < this.col - 1) { //right
            roundTiles.push(this.tiles[i + 1]);
        }
        if (i % this.col < this.col - 1 && Math.floor(i / this.col) > 0) { //right top
            roundTiles.push(this.tiles[i - this.col + 1]);
        }
        if (i % this.col < this.col - 1 && Math.floor(i / this.col) < this.row - 1) { //right bottom
            roundTiles.push(this.tiles[i + this.col + 1]);
        }
        return roundTiles;
    },

    onTouchTile: function(touchTile) {
        // check boom

        if (this.gameState != GAME_STATE.PLAY) {
            return;
        }

        switch (this.touchState) {
            case TOUCH_STATE.BLANK:
                if (touchTile.getComponent("Tile").type === this.Tile.TYPE.BOMB_REVEALED) {
                    touchTile.getComponent("Tile").type = this.Tile.TYPE.BOMB_DEATH;
                    touchTile.getComponent("Tile").state = this.Tile.STATE.CLICKED;
                    this.gameOver();
                    return;
                }
                var testTiles = [];
                if (touchTile.getComponent("Tile").state === this.Tile.STATE.NONE) {
                    testTiles.push(touchTile);
                    while (testTiles.length) {
                        var testTile = testTiles.pop();
                        if (testTile.getComponent("Tile").type === 0) {
                            testTile.getComponent("Tile").state = this.Tile.STATE.CLICKED;
                            var roundTiles = this.tileRound(parseInt(testTile.name));
                            //debugger
                            for (var i = 0; i < roundTiles.length; i++) {
                                if (roundTiles[i].getComponent("Tile").state == this.Tile.STATE.NONE) {
                                    //debugger
                                    testTiles.push(roundTiles[i]);
                                }
                            }
                        } else if (testTile.getComponent("Tile").type > 0 && testTile.getComponent("Tile").type < 4) {
                            //debugger
                            testTile.getComponent("Tile").state = this.Tile.STATE.CLICKED;
                        }
                    }
                    this.judgeWin();
                }

                break;
            case TOUCH_STATE.FLAG:
                if (touchTile.getComponent("Tile").state == this.Tile.STATE.NONE) {
                    touchTile.getComponent("Tile").state = this.Tile.STATE.FLAG;
                } else if (touchTile.getComponent("Tile").state == this.Tile.STATE.FLAG) {
                    touchTile.getComponent("Tile").state = this.Tile.STATE.DOUBT;
                } else {
                    touchTile.getComponent("Tile").state = this.Tile.STATE.NONE;
                }
                break;
            default:
                break;
        }

    },

    judgeWin: function() {
        var confNum = 0;
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].getComponent("Tile").state === this.Tile.STATE.CLICKED) {
                confNum++;

            }
        }
        if (confNum === this.tiles.length - this.bombNum) {
            this.gameState = GAME_STATE.WIN;
            this.btnShow.getComponent(cc.Sprite).spriteFrame = this.picWin;
        }
    },

    gameOver: function() {
        console.log("mo tat ca bom");
        //duyet mang 2 chieu
        //kiem tra type
        //neu phan tu nao == key boom => set state = clicked
        //xong
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].getComponent("Tile").type === this.Tile.TYPE.BOMB_REVEALED) {

                // if (this.Tile.TYPE.BOMB_REVEALED === this.Tile.TYPE.FLAG) {
                //     this.tiles[i].getComponent("Tile").state = this.Tile.STATE.FLAG;
                // }
                this.tiles[i].getComponent("Tile").state = this.Tile.STATE.CLICKED;
            }
        }
        this.gameState = GAME_STATE.DEAD;
        this.btnShow.getComponent(cc.Sprite).spriteFrame = this.picDead;

    },


    onBtnShow: function() {
        if (this.gameState === GAME_STATE.PREPARE) {
            this.newGame();
        }
        if (this.gameState === GAME_STATE.DEAD) {
            // this.bombNum--;
            this.newGame();
        }
        if (this.gameState === GAME_STATE.WIN) {
            this.bombNum++;
            this.newGame();
        }
    },
    countDownGamePlay(timeCount, lbCountUp) {
        var _this = this;
        this.timeGetVip = setInterval(() => {
            if (!cc.isValid(_this)) {
                clearInterval(_this.timeGetVip);
                _this.timeGetVip = null;
                return;
            }
            var day = Math.floor(timeCount / (24 * 60 * 60 * 1000));
            var h = timeCount % (24 * 60 * 60 * 1000);
            var hour = Math.floor(h / (60 * 60 * 1000));
            var m = h % (1000 * 60 * 60);
            var minutes = Math.floor(m / (1000 * 60));
            var s = m % (1000 * 60);
            var seconds = Math.floor(s / 1000);
            // if (minutes < 0) {
            //     lbCountDown.string  = this.formatData(minutes) + ":" + this.formatData(seconds);
            // } else {
            lbCountUp.string = this.formatData(minutes) + ":" + this.formatData(seconds);
            // }
            timeCount += 1000;
            if (_this.gameState === GAME_STATE.DEAD) {
                clearInterval(_this.timeGetVip);
                //     //end game
            }
        }, 1000);
        this.listInter.push(this.timeGetVip);
    },
    formatData(time) {
        if (time <= 0) {
            return "00";
        } else {
            if (time < 10) {
                return "0" + time;
            } else {
                return "" + time;
            }
        }
    },
    countBombs() {

    },


});