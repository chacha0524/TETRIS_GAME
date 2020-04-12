"use strict"

//落ちるスピード
const GAME_SPEED = 500;

//フィールドサイズ
const FIELD_COL = 10;
const FIELD_ROW = 20;

//ブロック１つのサイズ(ピクセル)
const BLOCK_SIZE = 30;

//スクリーンサイズ
const SCREEN_W = BLOCK_SIZE * FIELD_COL;
const SCREEN_H = BLOCK_SIZE * FIELD_ROW;

//テトロミノのサイズ
const TETRO_SIZE = 4;

let can = document.getElementById("can");
let con = can.getContext("2d");

can.width = SCREEN_W;
can.height = SCREEN_H;
can.style.border = "2px solid #555";

const TETRO_COLORS = [
  "#000",//0.空
  "#6CF",//1.水色
  "#F92",//2.オレンジ
  "#66F",//3.青
  "#C5C",//4.紫
  "#FD2",//5.黄色
  "#F44",//6.赤
  "#5B5",//7.緑
];

//テトロミノの本体
const TETRO_TYPES = [
  //0.空
  [],
  //1.I
  [
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0],
    [0,0,0,0]
  ],
  //2.L
  [
    [0,1,0,0],
    [0,1,0,0],
    [0,1,1,0],
    [0,0,0,0]
  ],
  //3.J
  [
    [0,0,1,0],
    [0,0,1,0],
    [0,1,1,0],
    [0,0,0,0]
  ],
  //4.T
  [
    [0,1,0,0],
    [0,1,1,0],
    [0,1,0,0],
    [0,0,0,0],
  ],
  //5.0
  [
    [0,0,0,0],
    [0,1,1,0],
    [0,1,1,0],
    [0,0,0,0],
  ],
  //6.Z
  [
    [0,0,0,0],
    [1,1,0,0],
    [0,1,1,0],
    [0,0,0,0],
  ],
  //7.S
  [
    [0,0,0,0],
    [0,1,1,0],
    [1,1,0,0],
    [0,0,0,0],
  ],

]

const START_X = FIELD_COL/2 - TETRO_SIZE/2;
const START_Y = 0;

//テトロミノ本体
let tetro;

//テトロミノの座標
let tetro_x = START_X;
let tetro_y = START_Y;
//テトロミノの形
let tetro_t;

//フィールドの中身
let field = [];

//ゲームオーバーフラグ
let over = false

//消したライン数
let score = 0;

tetro_t = Math.floor( Math.random() * (TETRO_TYPES.length -1) +1 );
tetro = TETRO_TYPES[ tetro_t];


init();
drawAll();

setInterval(dropTetro, GAME_SPEED);

//初期化
function init(){
  
  //フィールドのクリア
  for(let y=0; y<FIELD_ROW; y++){

    field[y]=[];
  
    for(let x = 0; x <FIELD_COL; x++){
      field[y][x] = 0;
    }
  }
  
  field[5][8] = 1;
  field[19][0] = 1;
  field[19][9] = 1;
}

//ブロック１つを描画する
function drawBlock(x,y,c){
  let px = x * BLOCK_SIZE;
  let py = y * BLOCK_SIZE;

  con.fillStyle = TETRO_COLORS[c];
  con.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
  con.strokeStyle="black";
  con.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE)
}

//全て描画
function drawAll(){
  con.clearRect(0,0,SCREEN_W,SCREEN_H);

  for(let y = 0; y < FIELD_ROW; y++){
    for(let x = 0; x < FIELD_COL; x++){
      if( field[y][x] ){
        drawBlock(x, y, field[y][x]);
      }
    }
  }

  for(let y=0; y < TETRO_SIZE; y++){
    for(let x=0; x < TETRO_SIZE; x++){
      if(tetro[y][x]){
        drawBlock(tetro_x + x,tetro_y + y, tetro_t);
      }
    }
  }
  if(over){
    let s = "GAME OVER";
    con.font = "40px 'MS ゴシック'";
    let w = con.measureText(s).width;
    let x = SCREEN_W/2 - w/2;
    let y = SCREEN_H/2 - 20;
    con.lineWidth = 4;
    con.strokeText(s,x,y);
    con.fillStyle ="white";
    con.fillText(s,x,y);
  }
}

//ブロックの衝突判定
function checkMove( mx, my, ntetro ) {

  if(ntetro == undefined) ntetro = tetro;

  for(let y=0; y < TETRO_SIZE; y++){
    for(let x=0; x < TETRO_SIZE; x++){
    
      if(ntetro[y][x]){
        let nx = tetro_x + mx + x;
        let ny = tetro_y + my + y;

        if (ny<0 || nx<0 || ny>=FIELD_ROW || nx>=FIELD_COL || field[ny][nx]) return false;
      }
    }
  }

  return true;
}

//テトロの回転
function rotate(){
  let ntetro = [];

  for(let y=0; y < TETRO_SIZE; y++){

    ntetro[y]=[];
    for(let x=0; x < TETRO_SIZE; x++){
      ntetro[y][x] = tetro[TETRO_SIZE-1-x][y];
    }
  }
  return ntetro; 
}

//テトロの固定
function fixTetro(){
  for(let y=0; y < TETRO_SIZE; y++){
    for(let x=0; x < TETRO_SIZE; x++){
      if(tetro[y][x]){
        field[tetro_y + y][tetro_x + x] = tetro_t;
      }
    }
  }
}

//ラインが揃ったかチェックして消す
function checkLine(){

  let linec = 0;
  for(let y=0; y < FIELD_ROW; y++){
    let flag = true;
    for(let x=0; x < FIELD_COL; x++){
      if( !field[y][x] ){
        flag = false;
        break;
      }
    }
    if(flag){
      linec++;

      for(let ny = y; ny>0 ; ny--){
        for(let nx = 0; nx<FIELD_COL; nx++){
          field[ny][nx] = field[ny-1][nx];
        }
      }
    }
  }
}

//テトロが落ちる処理
function dropTetro(){
  if(over) return;
  if(checkMove(0,1)) tetro_y++;
  else{
    fixTetro();
    checkLine();

    tetro_t = Math.floor( Math.random() * (TETRO_TYPES.length -1) +1 );
    tetro = TETRO_TYPES[tetro_t];
    tetro_x =START_X;
    tetro_y =START_Y;

    if(!checkMove(0,0)){
      over = true;
    }
  }
  drawAll();
}

//キーボードが押されたときの処理
document.onkeydown = function(e){ 
  if(over) return;
//onkeydown keycode 検索
  switch(e.keyCode){
    case 37://左
      if(checkMove(-1,0)) tetro_x--;
      break;
    case 38://上
      while(checkMove(0,1)) tetro_y++;
      break;
    case 39://右
      if(checkMove(1,0)) tetro_x++;
      break;
    case 40://下
      if(checkMove(0,1)) tetro_y++;
      
      break;
    case 32://スペース
    let ntetro = rotate();
    if(checkMove(0, 0, ntetro)) tetro = ntetro;
    
      break;
  }

  drawAll();
}